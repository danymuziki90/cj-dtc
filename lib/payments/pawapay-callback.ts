import { constants, createHash, createVerify, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncEnrollmentPaymentStatus, toCanonicalPaymentStatus } from '@/lib/payments/status'
import { provisionStudentAccountFromEnrollment } from '@/lib/student/account-provisioning'

type JsonRecord = Record<string, unknown>

type PublicKeyRecord = {
  keyId: string
  publicKey: string
  algorithm?: string | null
}

type ParsedSignatureInput = {
  label: string
  components: string[]
  params: Record<string, string | number>
  rawInput: string
}

let cachedPublicKeys: { expiresAt: number; keys: PublicKeyRecord[] } | null = null

function splitTopLevel(value: string) {
  const parts: string[] = []
  let current = ''
  let inQuotes = false
  let parenDepth = 0

  for (const char of value) {
    if (char === '"') inQuotes = !inQuotes
    if (!inQuotes && char === '(') parenDepth += 1
    if (!inQuotes && char === ')') parenDepth = Math.max(0, parenDepth - 1)

    if (!inQuotes && parenDepth === 0 && char === ',') {
      if (current.trim()) parts.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  if (current.trim()) parts.push(current.trim())
  return parts
}

function parseNotes(notes: string | null) {
  if (!notes) return {}
  try {
    return JSON.parse(notes) as JsonRecord
  } catch {
    return { raw: notes }
  }
}

function safeJsonParse(rawBody: string) {
  try {
    const parsed = JSON.parse(rawBody) as unknown
    if (Array.isArray(parsed)) {
      return (parsed[0] ?? null) as JsonRecord | null
    }
    if (parsed && typeof parsed === 'object') return parsed as JsonRecord
    return null
  } catch {
    return null
  }
}

function normalizeWebhookStatus(payload: JsonRecord) {
  const candidates = [
    payload.status,
    payload.result,
    payload.paymentStatus,
    payload.depositStatus,
    payload.failureCode,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return toCanonicalPaymentStatus(candidate)
    }
  }

  return 'pending'
}

function extractDepositId(payload: JsonRecord) {
  const candidates = [
    payload.depositId,
    payload.depositID,
    payload.transactionId,
    payload.reference,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
  }

  return null
}

function extractCurrency(payload: JsonRecord) {
  const direct = [payload.currency, payload.requestedCurrency, payload.depositedCurrency]
  for (const candidate of direct) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim().toUpperCase()
  }

  const amountRecord = payload.amount
  if (amountRecord && typeof amountRecord === 'object' && !Array.isArray(amountRecord)) {
    const nestedCurrency = (amountRecord as JsonRecord).currency
    if (typeof nestedCurrency === 'string' && nestedCurrency.trim()) {
      return nestedCurrency.trim().toUpperCase()
    }
  }

  return null
}

function extractAmount(payload: JsonRecord) {
  const direct = [payload.amount, payload.requestedAmount, payload.depositedAmount]

  for (const candidate of direct) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate
    if (typeof candidate === 'string' && candidate.trim()) {
      const parsed = Number(candidate)
      if (Number.isFinite(parsed)) return parsed
    }
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      const nestedValue = (candidate as JsonRecord).amount ?? (candidate as JsonRecord).value
      if (typeof nestedValue === 'number' && Number.isFinite(nestedValue)) return nestedValue
      if (typeof nestedValue === 'string' && nestedValue.trim()) {
        const parsed = Number(nestedValue)
        if (Number.isFinite(parsed)) return parsed
      }
    }
  }

  return null
}

function splitSignatureParams(value: string) {
  return value
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseSignatureInputHeader(headerValue: string) {
  const items = splitTopLevel(headerValue)
  const parsed = new Map<string, ParsedSignatureInput>()

  for (const item of items) {
    const separatorIndex = item.indexOf('=')
    if (separatorIndex <= 0) continue

    const label = item.slice(0, separatorIndex).trim()
    const rawInput = item.slice(separatorIndex + 1).trim()
    const componentMatch = rawInput.match(/^\(([^)]*)\)/)
    if (!componentMatch) continue

    const components = Array.from(componentMatch[1].matchAll(/"([^"]+)"/g)).map((match) => match[1])
    const params: Record<string, string | number> = {}

    for (const segment of splitSignatureParams(rawInput.slice(componentMatch[0].length))) {
      const equalIndex = segment.indexOf('=')
      if (equalIndex <= 0) continue

      const key = segment.slice(0, equalIndex).trim()
      const rawValue = segment.slice(equalIndex + 1).trim()

      if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
        params[key] = rawValue.slice(1, -1)
        continue
      }

      const numeric = Number(rawValue)
      params[key] = Number.isFinite(numeric) ? numeric : rawValue
    }

    parsed.set(label, { label, components, params, rawInput })
  }

  return parsed
}

function parseSignatureHeader(headerValue: string) {
  const entries = new Map<string, Buffer>()

  for (const item of splitTopLevel(headerValue)) {
    const separatorIndex = item.indexOf('=')
    if (separatorIndex <= 0) continue

    const label = item.slice(0, separatorIndex).trim()
    const rawValue = item.slice(separatorIndex + 1).trim()

    if (rawValue.startsWith(':') && rawValue.endsWith(':')) {
      entries.set(label, Buffer.from(rawValue.slice(1, -1), 'base64'))
    }
  }

  return entries
}

function buildSignatureBase(request: NextRequest, input: ParsedSignatureInput) {
  const url = new URL(request.url)
  const lines = input.components.map((component) => {
    if (component === '@method') return `"@method": ${request.method.toUpperCase()}`
    if (component === '@authority') return `"@authority": ${url.host}`
    if (component === '@path') return `"@path": ${url.pathname}`
    if (component === '@query') return `"@query": ${url.search}`

    const headerValue = request.headers.get(component)
    if (headerValue === null) {
      throw new Error(`Missing signed header: ${component}`)
    }

    return `"${component}": ${headerValue}`
  })

  lines.push(`"@signature-params": ${input.rawInput}`)
  return lines.join('\n')
}

function verifyContentDigest(rawBody: string, contentDigestHeader: string | null) {
  if (!contentDigestHeader) return { ok: false, reason: 'Missing Content-Digest header.' }

  for (const item of splitTopLevel(contentDigestHeader)) {
    const match = item.match(/^(sha-256|sha-512)=:([^:]+):$/i)
    if (!match) continue

    const algorithm = match[1].toLowerCase()
    const expected = Buffer.from(match[2], 'base64')
    const actual = createHash(algorithm.replace('-', '')).update(rawBody).digest()

    if (expected.length === actual.length && timingSafeEqual(expected, actual)) {
      return { ok: true, algorithm }
    }
  }

  return { ok: false, reason: 'Content-Digest verification failed.' }
}

function normalizePublicKey(value: string) {
  const trimmed = value.trim()
  if (trimmed.includes('BEGIN PUBLIC KEY')) return trimmed
  return `-----BEGIN PUBLIC KEY-----\n${trimmed}\n-----END PUBLIC KEY-----`
}

async function fetchPawaPayPublicKeys() {
  const now = Date.now()
  if (cachedPublicKeys && cachedPublicKeys.expiresAt > now) {
    return cachedPublicKeys.keys
  }

  const apiKey = process.env.PAWAPAY_API_KEY
  const apiBaseUrl = process.env.PAWAPAY_API_URL || 'https://api.sandbox.pawapay.io'
  const publicKeysPath = process.env.PAWAPAY_PUBLIC_KEYS_PATH || '/public-key/http'

  if (!apiKey) {
    throw new Error('PAWAPAY_API_KEY is required to verify signed callbacks.')
  }

  const parsedBaseUrl = new URL(apiBaseUrl)
  if (parsedBaseUrl.protocol !== 'https:') {
    throw new Error('PAWAPAY_API_URL must use HTTPS.')
  }

  const response = await fetch(`${parsedBaseUrl.origin}${publicKeysPath}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Unable to fetch PawaPay public keys (${response.status}).`)
  }

  const payload = (await response.json()) as unknown
  const rows = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object'
    ? (((payload as JsonRecord).keys as unknown[]) ||
        ((payload as JsonRecord).data as unknown[]) ||
        [])
    : []

  const keys = rows
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as JsonRecord
      const keyId =
        (typeof row.keyId === 'string' && row.keyId) ||
        (typeof row.kid === 'string' && row.kid) ||
        (typeof row.key_id === 'string' && row.key_id) ||
        null
      const publicKey =
        (typeof row.publicKey === 'string' && row.publicKey) ||
        (typeof row.pem === 'string' && row.pem) ||
        (typeof row.key === 'string' && row.key) ||
        (typeof row.publicKeyPem === 'string' && row.publicKeyPem) ||
        null
      const algorithm = typeof row.algorithm === 'string' ? row.algorithm : null

      if (!keyId || !publicKey) return null
      return { keyId, publicKey: normalizePublicKey(publicKey), algorithm }
    })
    .filter((item): item is PublicKeyRecord => Boolean(item))

  cachedPublicKeys = {
    keys,
    expiresAt: now + 10 * 60 * 1000,
  }

  return keys
}

function verifyHttpSignature(signatureBase: string, signature: Buffer, publicKey: string, algorithm: string) {
  const normalized = algorithm.toLowerCase()
  const hashAlgorithm = normalized.includes('sha512')
    ? 'sha512'
    : normalized.includes('sha384')
    ? 'sha384'
    : 'sha256'

  const verifier = createVerify(hashAlgorithm)
  verifier.update(signatureBase)
  verifier.end()

  if (normalized.startsWith('rsa-pss')) {
    return verifier.verify(
      {
        key: publicKey,
        padding: constants.RSA_PKCS1_PSS_PADDING,
        saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
      },
      signature
    )
  }

  return verifier.verify(publicKey, signature)
}

async function verifyPawaPayCallbackSecurity(request: NextRequest, rawBody: string) {
  const digestResult = verifyContentDigest(rawBody, request.headers.get('content-digest'))
  const signatureHeader = request.headers.get('signature')
  const signatureInputHeader = request.headers.get('signature-input')
  const requireSignedCallbacks = process.env.PAWAPAY_REQUIRE_SIGNED_CALLBACKS === 'true'

  if (!signatureHeader || !signatureInputHeader) {
    if (requireSignedCallbacks) {
      return {
        ok: false,
        status: 401,
        body: { error: 'Signed callback headers are required.' },
      }
    }

    return {
      ok: true,
      verification: {
        mode: 'payload_only',
        digestVerified: digestResult.ok,
        signatureVerified: false,
        reason: digestResult.ok ? null : digestResult.reason,
      },
    }
  }

  if (!digestResult.ok) {
    return {
      ok: false,
      status: 401,
      body: { error: digestResult.reason || 'Invalid content digest.' },
    }
  }

  const signatureInputs = parseSignatureInputHeader(signatureInputHeader)
  const signatures = parseSignatureHeader(signatureHeader)
  const firstSignatureLabel = Array.from(signatureInputs.keys())[0]

  if (!firstSignatureLabel) {
    return {
      ok: false,
      status: 401,
      body: { error: 'Unable to parse Signature-Input header.' },
    }
  }

  const input = signatureInputs.get(firstSignatureLabel)
  const signature = signatures.get(firstSignatureLabel)

  if (!input || !signature) {
    return {
      ok: false,
      status: 401,
      body: { error: 'Signature label mismatch.' },
    }
  }

  const now = Math.floor(Date.now() / 1000)
  const created = typeof input.params.created === 'number' ? input.params.created : null
  const expires = typeof input.params.expires === 'number' ? input.params.expires : null

  if (created && created - 300 > now) {
    return {
      ok: false,
      status: 401,
      body: { error: 'Signed callback is not valid yet.' },
    }
  }

  if (expires && now > expires + 300) {
    return {
      ok: false,
      status: 401,
      body: { error: 'Signed callback has expired.' },
    }
  }

  let signatureBase: string

  try {
    signatureBase = buildSignatureBase(request, input)
  } catch (error) {
    return {
      ok: false,
      status: 401,
      body: {
        error: error instanceof Error ? error.message : 'Unable to build signature base.',
      },
    }
  }

  const keyId = typeof input.params.keyid === 'string' ? input.params.keyid : null
  const algorithm =
    typeof input.params.alg === 'string' ? input.params.alg : 'ecdsa-p256-sha256'
  let publicKeys: PublicKeyRecord[]

  try {
    publicKeys = await fetchPawaPayPublicKeys()
  } catch (error) {
    return {
      ok: false,
      status: 503,
      body: {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to fetch PawaPay public keys for callback verification.',
      },
    }
  }
  const selectedKey =
    (keyId ? publicKeys.find((item) => item.keyId === keyId) : null) || publicKeys[0] || null

  if (!selectedKey) {
    return {
      ok: false,
      status: 401,
      body: { error: 'No PawaPay public key available for callback verification.' },
    }
  }

  const verified = verifyHttpSignature(
    signatureBase,
    signature,
    selectedKey.publicKey,
    selectedKey.algorithm || algorithm
  )

  if (!verified) {
    return {
      ok: false,
      status: 401,
      body: { error: 'Invalid callback signature.' },
    }
  }

  return {
    ok: true,
    verification: {
      mode: 'signed',
      digestVerified: true,
      signatureVerified: true,
      keyId: selectedKey.keyId,
      algorithm: selectedKey.algorithm || algorithm,
    },
  }
}

function hasMatchingTransactionData(paymentAmount: number, expectedCurrency: string | null, payload: JsonRecord) {
  const callbackAmount = extractAmount(payload)
  const callbackCurrency = extractCurrency(payload)

  if (callbackAmount !== null && Math.abs(callbackAmount - paymentAmount) > 0.01) {
    return {
      ok: false,
      reason: 'Callback amount does not match the stored payment amount.',
    }
  }

  if (expectedCurrency && callbackCurrency && expectedCurrency !== callbackCurrency) {
    return {
      ok: false,
      reason: 'Callback currency does not match the stored payment currency.',
    }
  }

  return { ok: true, callbackAmount, callbackCurrency }
}

export async function handlePawaPayCallback(request: NextRequest) {
  try {
    const rawBody = await request.text()
    if (!rawBody.trim()) {
      return NextResponse.json({ error: 'Empty callback payload.' }, { status: 400 })
    }

    const payload = safeJsonParse(rawBody)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
    }

    const security = await verifyPawaPayCallbackSecurity(request, rawBody)
    if (!security.ok) {
      return NextResponse.json(security.body, { status: security.status })
    }

    const depositId = extractDepositId(payload)
    if (!depositId) {
      return NextResponse.json({ error: 'Missing deposit identifier.' }, { status: 400 })
    }

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ transactionId: depositId }, { reference: depositId }],
      },
      include: {
        enrollment: {
          select: { id: true },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found.' }, { status: 404 })
    }

    const existingNotes = parseNotes(payment.notes)
    const expectedCurrency =
      typeof existingNotes.currency === 'string' ? existingNotes.currency.toUpperCase() : null
    const transactionCheck = hasMatchingTransactionData(payment.amount, expectedCurrency, payload)

    if (!transactionCheck.ok) {
      return NextResponse.json({ error: transactionCheck.reason }, { status: 409 })
    }

    const status = normalizeWebhookStatus(payload)

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        transactionId: payment.transactionId || depositId,
        paidAt: status === 'success' ? new Date() : payment.paidAt,
        notes: JSON.stringify({
          ...existingNotes,
          gateway: 'pawapay',
          callbackPayload: payload,
          callbackSecurity: security.verification,
          callbackReceivedAt: new Date().toISOString(),
        }),
      },
    })

    await syncEnrollmentPaymentStatus(payment.enrollment.id)

    const autoProvisionResult =
      status === 'success'
        ? await provisionStudentAccountFromEnrollment({
            enrollmentId: payment.enrollment.id,
            appBaseUrl: new URL(request.url).origin,
            source: 'pawapay-callback',
            request,
          })
        : null

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status,
      depositId,
      studentAccount: autoProvisionResult
        ? {
            state: autoProvisionResult.accountStatus?.state || null,
            accountCreated: autoProvisionResult.accountCreated,
            accountActivated: autoProvisionResult.accountActivated,
          }
        : null,
    })
  } catch (error) {
    console.error('PawaPay callback error:', error)
    return NextResponse.json({ error: 'Unable to process callback.' }, { status: 500 })
  }
}



