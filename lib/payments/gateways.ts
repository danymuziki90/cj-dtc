import { randomUUID } from 'crypto'
import { toCanonicalPaymentStatus } from '@/lib/payments/status'

type JsonRecord = Record<string, unknown>

function stripTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function normalizeAmount(value: number) {
  return Number(value.toFixed(2))
}

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d+]/g, '')
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

export interface FlutterwaveInitInput {
  amount: number
  currency: string
  email: string
  fullName: string
  txRef: string
  redirectUrl: string
  narration?: string
}

export interface FlutterwaveInitResult {
  status: GatewayInitStatus
  paymentLink: string
  txRef: string
  message: string
  rawResponse?: JsonRecord | null
  isMock: boolean
}

export interface FlutterwaveVerifyResult {
  status: GatewayInitStatus
  transactionId: string
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
  const apiUrl = stripTrailingSlash(process.env.PAWAPAY_API_URL || 'https://api.sandbox.pawapay.io')
  const path = process.env.PAWAPAY_DEPOSIT_PATH || '/v1/deposits'
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

  const payload = [
    {
      depositId,
      amount: normalizedAmount.toFixed(2),
      currency: input.currency,
      correspondent: input.operator || process.env.PAWAPAY_DEFAULT_OPERATOR || 'AIRTEL_OAPI_UGANDA',
      country: input.countryCode || process.env.PAWAPAY_COUNTRY_CODE || 'UGA',
      payer: {
        type: 'MSISDN',
        address: {
          value: normalizePhoneNumber(input.phoneNumber),
        },
      },
      customerTimestamp: new Date().toISOString(),
      statementDescription: `CJ DTC ${input.externalReference}`,
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
    },
  ]

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

    return {
      status,
      depositId,
      message: response.ok
        ? 'PawaPay request initialized.'
        : 'PawaPay request failed during initialization.',
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
  const apiUrl = stripTrailingSlash(process.env.PAWAPAY_API_URL || 'https://api.sandbox.pawapay.io')
  const pathTemplate = process.env.PAWAPAY_DEPOSIT_STATUS_PATH || '/v1/deposits/{depositId}'

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

export async function initiateFlutterwavePayment(input: FlutterwaveInitInput): Promise<FlutterwaveInitResult> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY
  const apiUrl = stripTrailingSlash(process.env.FLUTTERWAVE_API_URL || 'https://api.flutterwave.com')
  const normalizedAmount = normalizeAmount(input.amount)

  if (!secretKey) {
    const mockedLink = `${input.redirectUrl}${input.redirectUrl.includes('?') ? '&' : '?'}status=successful&tx_ref=${encodeURIComponent(input.txRef)}`
    return {
      status: 'pending',
      paymentLink: mockedLink,
      txRef: input.txRef,
      message: 'Flutterwave keys are missing, payment is running in mock mode.',
      isMock: true,
    }
  }

  const payload = {
    tx_ref: input.txRef,
    amount: normalizedAmount,
    currency: input.currency,
    redirect_url: input.redirectUrl,
    payment_options: 'card,mobilemoney,banktransfer',
    customer: {
      email: input.email,
      name: input.fullName,
    },
    customizations: {
      title: 'CJ Development Training Center',
      description: input.narration || 'Session registration payment',
    },
  }

  try {
    const response = await fetch(`${apiUrl}/v3/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const rawResponse = (await parseJsonResponse(response)) as JsonRecord | null
    const link = ((rawResponse?.data as JsonRecord | undefined)?.link as string | undefined) || ''

    if (!response.ok || !link) {
      return {
        status: 'failed',
        paymentLink: input.redirectUrl,
        txRef: input.txRef,
        message: 'Flutterwave failed to generate a payment link.',
        rawResponse,
        isMock: false,
      }
    }

    return {
      status: 'pending',
      paymentLink: link,
      txRef: input.txRef,
      message: 'Flutterwave payment link created.',
      rawResponse,
      isMock: false,
    }
  } catch (error) {
    return {
      status: 'pending',
      paymentLink: input.redirectUrl,
      txRef: input.txRef,
      message: 'Flutterwave network call failed, payment remains pending.',
      rawResponse: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      isMock: false,
    }
  }
}

export async function verifyFlutterwaveTransaction(transactionId: string): Promise<FlutterwaveVerifyResult> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY
  const apiUrl = stripTrailingSlash(process.env.FLUTTERWAVE_API_URL || 'https://api.flutterwave.com')

  if (!secretKey) {
    return {
      status: 'success',
      transactionId,
      isMock: true,
    }
  }

  try {
    const response = await fetch(`${apiUrl}/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      cache: 'no-store',
    })

    const rawResponse = (await parseJsonResponse(response)) as JsonRecord | null
    const remoteStatus = ((rawResponse?.data as JsonRecord | undefined)?.status as string | undefined) || ''
    const status = toCanonicalPaymentStatus(remoteStatus)

    return {
      status,
      transactionId,
      rawResponse,
      isMock: false,
    }
  } catch (error) {
    return {
      status: 'pending',
      transactionId,
      rawResponse: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      isMock: false,
    }
  }
}
