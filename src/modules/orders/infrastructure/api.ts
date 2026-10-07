import { http } from '@/shared/infrastructure/http/client'
import type { CreateOrderInput, Order } from '../domain/types'

export const ordersApi = {
  create: (input: CreateOrderInput, idempotencyKey: string) =>
    http.post<Order>('/orders', input, { headers: { 'Idempotency-Key': idempotencyKey } }).then((r) => r.data),
  get: (id: string, signal?: AbortSignal) => http.get<Order>(`/orders/${id}`, { signal }).then((r) => r.data),
}
