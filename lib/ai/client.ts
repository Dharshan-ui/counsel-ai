import { Platform } from 'react-native'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const PRIMARY_MODEL = 'deepseek/deepseek-chat-v3.1'
const FALLBACK_MODEL = 'google/gemini-2.5-flash-lite'
const TIMEOUT_MS = 90_000

function getBaseUrl(): string {
  if (!__DEV__) return OPENROUTER_URL

  // Web dev: proxy runs on the same machine as the browser — always localhost.
  if (Platform.OS === 'web') return 'http://localhost:8787/v1/chat/completions'

  // Native dev (Android/iOS): proxy is on the dev machine, reached via LAN IP.
  if (process.env.EXPO_PUBLIC_DEV_PROXY === '1') {
    const host = process.env.EXPO_PUBLIC_DEV_PROXY_HOST ?? 'localhost'
    return `http://${host}:8787/v1/chat/completions`
  }

  return OPENROUTER_URL
}

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class AIRateLimitError extends Error {
  constructor(model: string) {
    super(`Rate limited by model: ${model}`)
    this.name = 'AIRateLimitError'
  }
}

export class AINetworkError extends Error {
  cause: unknown
  constructor(detail?: string, options?: { cause?: unknown }) {
    super(`Network error: ${detail ?? 'unknown'}`)
    this.name = 'AINetworkError'
    this.cause = options?.cause
    if (options?.cause !== undefined) {
      console.error('[AI] AINetworkError cause:', options.cause)
    }
  }
}

export class AIInvalidResponseError extends Error {
  constructor(detail?: string) {
    super(`Invalid AI response: ${detail ?? 'no content returned'}`)
    this.name = 'AIInvalidResponseError'
  }
}

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY
  if (!key) throw new Error('Set EXPO_PUBLIC_OPENROUTER_API_KEY in .env.local')
  return key
}

// XHR-based request wrapper — avoids the whatwg-fetch polyfill on Android that
// swallows AbortSignal and silently drops timed-out requests. xhr.timeout is
// honoured natively by React Native's XHR implementation. Each call gets its
// own XHR instance so primary and fallback each have a fresh 90 s budget.
type XHRResponse = {
  status: number
  ok: boolean
  text: () => Promise<string>
}

function rnRequest(
  url: string,
  opts: {
    method?: string
    headers?: Record<string, string>
    body?: string
    timeout?: number
  },
): Promise<XHRResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(opts.method ?? 'POST', url)
    Object.entries(opts.headers ?? {}).forEach(([k, v]) => xhr.setRequestHeader(k, v))
    xhr.timeout = opts.timeout ?? TIMEOUT_MS
    xhr.ontimeout = () => reject(new Error(`Timeout after ${xhr.timeout}ms`))
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.onload = () =>
      resolve({
        status: xhr.status,
        ok: xhr.status >= 200 && xhr.status < 300,
        text: () => Promise.resolve(xhr.responseText),
      })
    xhr.send(opts.body)
  })
}

async function callModel(
  messages: ChatMessage[],
  model: string,
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const url = getBaseUrl()
  console.log('[AI] fetching:', url, 'model:', model)

  let response: XHRResponse
  try {
    response = await rnRequest(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost',
        'X-Title': 'Counsel',
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
      timeout: TIMEOUT_MS,
    })
  } catch (err) {
    console.error('[AI] raw fetch error:', (err as Error)?.name, (err as Error)?.message, (err as Error)?.stack)
    throw new AINetworkError(err instanceof Error ? err.message : 'request failed', { cause: err })
  }

  // Fires as soon as the response headers arrive (body not yet read).
  console.log('[AI] first chunk received — status:', response.status)

  if (response.status === 429 || response.status >= 500) {
    throw new AIRateLimitError(model)
  }

  if (!response.ok) {
    const body = await response.text().catch(() => 'unknown')
    throw new AIInvalidResponseError(`HTTP ${response.status}: ${body}`)
  }

  const text = await response.text()
  console.log('[AI] raw response (first 200 chars):', text.slice(0, 200))

  let data: { choices?: { message?: { content?: string } }[] }
  try {
    data = JSON.parse(text)
  } catch (err) {
    throw new AIInvalidResponseError(`JSON parse failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new AIInvalidResponseError('Empty content in response')
  return content
}

export async function chat(
  messages: ChatMessage[],
  opts?: {
    model?: string
    temperature?: number
    maxTokens?: number
    jsonMode?: boolean
  },
): Promise<string> {
  const key = process.env.EXPO_PUBLIC_NVIDIA_API_KEY
  console.log('[AI] key present:', !!key)
  console.log('[AI] key length:', key?.length ?? 0)
  const primaryModel = opts?.model ?? PRIMARY_MODEL
  console.log('[AI] model:', primaryModel)
  console.log('[AI] platform:', Platform.OS)
  console.log('[AI] base url:', getBaseUrl())

  getApiKey()

  const temperature = opts?.temperature ?? 0.7
  const maxTokens = opts?.maxTokens ?? 1024

  const finalMessages: ChatMessage[] = opts?.jsonMode
    ? [
        ...messages,
        {
          role: 'system',
          content: 'Respond with strictly valid JSON only. No prose, no markdown fences.',
        },
      ]
    : messages

  // Each callModel() creates its own XHR with its own xhr.timeout budget,
  // so the fallback always gets a fresh 90 s — no shared AbortController needed.
  try {
    const result = await callModel(finalMessages, primaryModel, temperature, maxTokens)
    console.log('[AI] primary succeeded, returning')
    if (__DEV__) console.info(`[Counsel AI] Served by ${primaryModel}`)
    return result
  } catch (primaryErr) {
    if (primaryErr instanceof AIRateLimitError || primaryErr instanceof AINetworkError) {
      if (__DEV__) console.info(`[Counsel AI] Primary failed, falling back to ${FALLBACK_MODEL}`)
      const result = await callModel(finalMessages, FALLBACK_MODEL, temperature, maxTokens)
      if (__DEV__) console.info(`[Counsel AI] Served by fallback ${FALLBACK_MODEL}`)
      return result
    }
    throw primaryErr
  }
}
