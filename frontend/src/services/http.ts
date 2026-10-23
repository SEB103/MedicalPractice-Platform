/** Minimal same-origin JSON client for /api/v1/ (session cookie + CSRF header). */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields: Record<string, string[]> = {},
  ) {
    super(message)
  }
}

const BASE = '/api/v1/'
const TIMEOUT_MS = 15000

function csrfToken(): string {
  return document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)?.[1] ?? ''
}

export async function api<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PATCH'; body?: unknown; query?: Record<string, string> } = {},
): Promise<T> {
  const method = options.method ?? 'GET'
  if (method !== 'GET' && !csrfToken()) await fetch(BASE + 'auth/csrf/', { credentials: 'same-origin' })
  const url = BASE + path + (options.query ? '?' + new URLSearchParams(options.query).toString() : '')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch(url, {
      method,
      credentials: 'same-origin',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(method !== 'GET' ? { 'X-CSRFToken': csrfToken() } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    })
  } catch {
    throw new ApiError(0, 'network_error', 'Keine Verbindung zur Praxis. Bitte versuchen Sie es erneut.')
  } finally {
    clearTimeout(timer)
  }
  if (response.status === 204) return undefined as T
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>
  if (!response.ok)
    throw new ApiError(
      response.status,
      typeof data.code === 'string' ? data.code : 'error',
      typeof data.message === 'string' && data.message
        ? data.message
        : 'Die Anfrage konnte nicht verarbeitet werden.',
      (data.fields as Record<string, string[]>) ?? {},
    )
  return data as T
}

/** First message per field, for showing next to form inputs. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {}
  return Object.fromEntries(
    Object.entries(error.fields).map(([field, messages]) => [field, String([messages].flat()[0])]),
  )
}
