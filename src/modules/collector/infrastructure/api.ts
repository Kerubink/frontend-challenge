import { http } from '@/shared/infrastructure/http/client'
import type { User } from '@/modules/identity/domain/types'

export type ProfileInput = Pick<User, 'displayName' | 'username' | 'email'> & {
  ens?: string
  walletAlias?: string
  avatarUrl?: string | null
}

export const collectorApi = {
  update: (b: ProfileInput) => http.put<User>('/profile', b).then((r) => r.data),
  changePassword: (b: { current: string; next: string }) => http.put('/profile/password', b).then(() => undefined),
}
