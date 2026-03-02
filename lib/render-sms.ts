interface RenderSmsOptions {
  preview_mode?: boolean
  test_phone?: string
}

interface RenderSmsBaseResponse {
  success: boolean
  error?: string
  [key: string]: unknown
}

const BASE_URL = process.env.RENDER_API_URL || 'https://main-website-files.onrender.com'

async function postRenderSms(
  endpoint: string,
  payload: Record<string, unknown>
): Promise<RenderSmsBaseResponse> {
  const apiKey = process.env.RENDER_API_KEY
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  let data: RenderSmsBaseResponse
  try {
    data = await res.json()
  } catch {
    data = { success: false, error: 'Invalid JSON response from SMS service' }
  }

  if (!res.ok && !data.error) {
    return { ...data, success: false, error: `SMS service HTTP ${res.status}` }
  }
  return data
}

export async function sendSingleSms(input: {
  phone: string
  message: string
} & RenderSmsOptions): Promise<RenderSmsBaseResponse> {
  return postRenderSms('/api/send-single', {
    phone: input.phone,
    message: input.message,
    preview_mode: input.preview_mode,
    test_phone: input.test_phone,
  })
}

export async function sendBatchMms(input: {
  images: { url: string }[]
  message: string
  send_to_all?: boolean
} & RenderSmsOptions): Promise<RenderSmsBaseResponse> {
  return postRenderSms('/api/send-batch', {
    images: input.images,
    message: input.message,
    send_to_all: input.send_to_all ?? false,
    preview_mode: input.preview_mode,
    test_phone: input.test_phone,
  })
}

export async function sendTextBatch(input: {
  message: string
} & RenderSmsOptions): Promise<RenderSmsBaseResponse> {
  return postRenderSms('/api/send-text-batch', {
    message: input.message,
    preview_mode: input.preview_mode,
    test_phone: input.test_phone,
  })
}

