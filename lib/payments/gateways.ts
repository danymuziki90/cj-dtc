import { randomUUID } from 'crypto'

type JsonRecord = Record<string, unknown>
type ResolvedCorrespondent = {
  correspondent: string
  country: string
}

const OPERATOR_ALIASES: Record<string, string> = {
  airtel: 'AIRTEL_COD',
  orange: 'ORANGE_COD',
  vodacom: 'VODACOM_MPESA_COD',
  mtn: 'MTN_MOMO_COD',
  'airtel_cod': 'AIRTEL_COD',
  'orange_cod': 'ORANGE_COD',
  'vodacom_mpesa_cod': 'VODACOM_MPESA_COD',
  'mtn_momo_cod': 'MTN_MOMO_COD',
}

function stripTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function normalizeAmount(value: number) {
  return Number(value.toFixed(2))
}

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, '')
}

function buildStatementDescription(externalReference: string) {
  const compactReference = externalReference.replace(/[^a-z0-9]/gi, '').toUpperCase()
  const candidate = `CJDTC${compactReference.slice(-17)}`
  return candidate.slice(0, 22)
}

function getSecureApiUrl(value: string, label: string) {
  const parsed = new URL(value)
  if (parsed.protocol !== 'https:') {
    throw new Error(`${label} must use HTTPS.`)
  }
  return stripTrailingSlash(parsed.toString())
}

function normalizeCountryCode(value?: string) {
  return (value || process.env.PAWAPAY_COUNTRY_CODE || 'COD').trim().toUpperCase()
}

function normalizeDepositPath(value: string | undefined, fallback: string) {
  const path = (value || fallback).trim()
  return path.replace(/^\/v1(?=\/deposits(?:\/|$))/, '')
}

function normalizeOperator(value?: string) {
  if (!value) return null

  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_')
  return OPERATOR_ALIASES[normalized] || value.trim().toUpperCase() || null
}

function inferCountryFromCorrespondent(correspondent: string) {
  const parts = correspondent.split('_')
  return parts[parts.length - 1] || normalizeCountryCode()
}

async function predictPawaPayCorrespondent(phoneNumber: string): Promise<ResolvedCorrespondent | null> {
  const apiKey = process.env.PAWAPAY_API_KEY
  if (!apiKey) return null

  const apiUrl = getSecureApiUrl(
    process.env.PAWAPAY_API_URL || 'https://api.sandbox.pawapay.io',
    'PAWAPAY_API_URL'
  )
  const msisdn = normalizePhoneNumber(phoneNumber)

  try {
    const response = await fetch(`${apiUrl}/v1/predict-correspondent`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        msisdn,
      }),
      cache: 'no-store',
    })

    if (!response.ok) return null

    const rawResponse = (await parseJsonResponse(response)) as JsonRecord | null
    const correspondent =
      (typeof rawResponse?.correspondent === 'string' && rawResponse.correspondent) ||
      (typeof rawResponse?.provider === 'string' && rawResponse.provider) ||
      null
    const country =
      (typeof rawResponse?.country === 'string' && rawResponse.country) ||
      (correspondent ? inferCountryFromCorrespondent(correspondent) : normalizeCountryCode())

    if (!correspondent) return null

    return {
      correspondent: correspondent.trim().toUpperCase(),
      country: country.trim().toUpperCase(),
    }
  } catch {
    return null
  }
}

async function resolvePawaPayCorrespondent(input: PawaPayInitInput): Promise<ResolvedCorrespondent> {
  const mappedOperator =
    normalizeOperator(input.operator) || normalizeOperator(process.env.PAWAPAY_DEFAULT_OPERATOR)

  if (mappedOperator) {
    return {
      correspondent: mappedOperator,
      country: input.countryCode || inferCountryFromCorrespondent(mappedOperator),
    }
  }

  const predicted = await predictPawaPayCorrespondent(input.phoneNumber)
  if (predicted) {
    return predicted
  }

  const fallbackCountry = normalizeCountryCode(input.countryCode)
  return {
    correspondent: `AIRTEL_${fallbackCountry}`,
    country: fallbackCountry,
  }
}

async function parseJsonResponse(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export type GatewayInitStatus = 'pending' | 'success' | 'failed'

export interface PawaPayInitInput {
  amount: number
  currency: string
  phoneNumber: string
  operator?: string
  countryCode?: string
  externalReference: string
  fullName: string
  email: string
}

export interface PawaPayInitResult {
  status: GatewayInitStatus
  depositId: string
  message: string
  rawResponse?: JsonRecord | null
  isMock: boolean
}

export interface PawaPayVerifyResult {
  status: GatewayInitStatus
  depositId: string
  rawResponse?: JsonRecord | null
  isMock: boolean
}

function inferPawaPayStatus(payload: unknown): GatewayInitStatus {
  if (!payload || typeof payload !== 'object') return 'pending'
  const value = JSON.stringify(payload).toLowerCase()
  if (value.includes('success') || value.includes('completed')) return 'success'
  if (value.includes('failed') || value.includes('rejected')) return 'failed'
  return 'pending'
}

export async function initiatePawaPayPayment(input: PawaPayInitInput): Promise<PawaPayInitResult> {
  const apiKey = process.env.PAWAPAY_API_KEY
  const apiUrl = getSecureApiUrl(
    process.env.PAWAPAY_API_URL || 'https://api.sandbox.pawapay.io',
    'PAWAPAY_API_URL'
  )
  const path = normalizeDepositPath(process.env.PAWAPAY_DEPOSIT_PATH, '/deposits')
  const normalizedAmount = normalizeAmount(input.amount)
  const depositId = randomUUID()

  if (!apiKey) {
    return {
      status: 'pending',
      depositId,
      message: 'PawaPay keys are missing, payment is running in mock mode.',
      isMock: true,
    }
  }

  const resolvedCorrespondent = await resolvePawaPayCorrespondent(input)
  const statementDescription = buildStatementDescription(input.externalReference)

  const payload = {
    depositId,
    amount: normalizedAmount.toFixed(2),
    currency: input.currency,
    correspondent: resolvedCorrespondent.correspondent,
    country: resolvedCorrespondent.country,
    payer: {
      type: 'MSISDN',
      address: {
        value: normalizePhoneNumber(input.phoneNumber),
      },
    },
    customerTimestamp: new Date().toISOString(),
    statementDescription,
    metadata: [
      {
        fieldName: 'fullName',
        fieldValue: input.fullName,
        isPII: true,
      },
      {
        fieldName: 'email',
        fieldValue: input.email,
        isPII: true,
      },
    ],
  }

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const rawResponse = (await parseJsonResponse(response)) as JsonRecord | null
    const status = response.ok ? inferPawaPayStatus(rawResponse) : 'failed'
    const errorMessage =
      rawResponse && typeof rawResponse.errorMessage === 'string'
        ? rawResponse.errorMessage
        : null

    return {
      status,
      depositId,
      message: response.ok
        ? 'PawaPay request initialized.'
        : errorMessage || 'PawaPay request failed during initialization.',
      rawResponse,
      isMock: false,
    }
  } catch (error) {
    return {
      status: 'pending',
      depositId,
      message: 'PawaPay network call failed, payment remains pending for reconciliation.',
      rawResponse: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      isMock: false,
    }
  }
}

export async function verifyPawaPayPayment(depositId: string): Promise<PawaPayVerifyResult> {
  const apiKey = process.env.PAWAPAY_API_KEY
  const apiUrl = getSecureApiUrl(
    process.env.PAWAPAY_API_URL || 'https://api.sandbox.pawapay.io',
    'PAWAPAY_API_URL'
  )
  const pathTemplate = normalizeDepositPath(process.env.PAWAPAY_DEPOSIT_STATUS_PATH, '/deposits/{depositId}')

  if (!apiKey) {
    return {
      status: 'pending',
      depositId,
      isMock: true,
    }
  }

  const path = pathTemplate.replace('{depositId}', encodeURIComponent(depositId))

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: 'no-store',
    })

    const rawResponse = (await parseJsonResponse(response)) as JsonRecord | null
    const status = response.ok ? inferPawaPayStatus(rawResponse) : 'failed'

    return {
      status,
      depositId,
      rawResponse,
      isMock: false,
    }
  } catch (error) {
    return {
      status: 'pending',
      depositId,
      rawResponse: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      isMock: false,
    }
  }
}
