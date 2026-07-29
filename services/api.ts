const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

let _authToken: string | null = null

export function setAuthToken(token: string | null) {
  _authToken = token
}

export function getAuthToken(): string | null {
  return _authToken
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function clientFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  })

  if (!response.ok) {
    let errorData: Record<string, unknown> = {}
    try {
      errorData = await response.json()
    } catch {
      // ignore parse failures
    }
    const message =
      (errorData.msg as string) ||
      (errorData.detail as string) ||
      (errorData.message as string) ||
      `Request failed: ${response.status}`
    const code = errorData.error_code as string | undefined
    throw new ApiError(message, response.status, code)
  }

  if (response.status === 204) return {} as T

  return response.json()
}

export const api = {
  get: <T>(endpoint: string) => clientFetch<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data: unknown) =>
    clientFetch<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),

  put: <T>(endpoint: string, data: unknown) =>
    clientFetch<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),

  patch: <T>(endpoint: string, data: unknown) =>
    clientFetch<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: <T>(endpoint: string) => clientFetch<T>(endpoint, { method: 'DELETE' }),
}
