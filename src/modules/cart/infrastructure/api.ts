import { http } from '@/shared/infrastructure/http/client'
import type { Cart } from '../domain/types'

export const cartApi = {
  get: () => http.get<Cart>('/cart').then((r) => r.data),
  add: (b: { nftId: string; edition: string; quantity: number }) => http.post<Cart>('/cart/items', b).then((r) => r.data),
  update: (b: { nftId: string; edition: string; quantity: number }) => http.patch<Cart>('/cart/items', b).then((r) => r.data),
  remove: (b: { nftId: string; edition: string }) => http.delete<Cart>('/cart/items', { params: b }).then((r) => r.data),
  applyCoupon: (code: string) => http.post<Cart>('/cart/coupon', { code }).then((r) => r.data),
  removeCoupon: () => http.delete<Cart>('/cart/coupon').then((r) => r.data),
  merge: (guestId: string) => http.post<Cart>('/cart/merge', { guestId }).then((r) => r.data),
}
