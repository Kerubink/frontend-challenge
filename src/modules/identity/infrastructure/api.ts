import { http } from '@/shared/infrastructure/http/client'
import type { AuthResult, User } from '../domain/types'

export const identityApi = {
  register: (b: { displayName: string; username: string; email: string; password: string }) =>
    http.post<AuthResult>('/auth/register', b).then((r) => r.data),
  login: (b: { email: string; password: string }) => http.post<AuthResult>('/auth/login', b).then((r) => r.data),
  session: () => http.get<User>('/auth/session').then((r) => r.data),
  logout: () => http.post('/auth/logout').then(() => undefined),
}
