import axios, { AxiosError } from 'axios'
import { env } from '@/shared/config/env'

const TOKEN_KEY = 'kurio.token'
const GUEST_KEY = 'kurio.guest'

const safe = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* storage indisponível */
    }
  },
  del: (k: string) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* storage indisponível */
    }
  },
}

export const tokenStore = {
  get: () => safe.get(TOKEN_KEY),
  set: (t: string) => safe.set(TOKEN_KEY, t),
  clear: () => safe.del(TOKEN_KEY),
}

export function guestId(): string {
  let id = safe.get(GUEST_KEY)
  if (!id) {
    id = `guest-${crypto.randomUUID()}`
    safe.set(GUEST_KEY, id)
  }
  return id
}
export const clearGuestId = () => safe.del(GUEST_KEY)

export const SESSION_EXPIRED_EVENT = 'auth:expired'

export const http = axios.create({ baseURL: env.apiBaseUrl, timeout: 10_000 })

http.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  else config.headers.set('X-Guest-Id', guestId())
  return config
})

http.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    const url = error.config?.url ?? ''
    if (error.response?.status === 401 && tokenStore.get() && !url.startsWith('/auth/login')) {
      tokenStore.clear()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    return Promise.reject(error)
  },
)

export interface ApiErrorBody {
  code?: string
  message?: string
  fields?: Record<string, string>
  [key: string]: unknown
}

export function apiError(err: unknown): { status?: number; body: ApiErrorBody; network: boolean } {
  if (axios.isAxiosError(err)) {
    return { status: err.response?.status, body: (err.response?.data as ApiErrorBody) ?? {}, network: !err.response }
  }
  return { body: { message: err instanceof Error ? err.message : 'Erro inesperado' }, network: false }
}

export function errorMessage(err: unknown): string {
  const e = apiError(err)
  if (e.network) return 'Sem conexão com o servidor. Tente novamente.'
  return e.body.message ?? 'Algo deu errado. Tente novamente.'
}
