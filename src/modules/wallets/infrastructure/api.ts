import { http } from '@/shared/infrastructure/http/client'
import type { Wallet, WalletInput } from '../domain/types'

export const walletsApi = {
  list: () => http.get<Wallet[]>('/wallets').then((r) => r.data),
  create: (b: WalletInput) => http.post<Wallet>('/wallets', b).then((r) => r.data),
  update: (id: string, b: WalletInput) => http.put<Wallet>(`/wallets/${id}`, b).then((r) => r.data),
}
