import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clearIdempotencyKey, idempotencyKeyFor } from '@/shared/infrastructure/idempotency'
import { useCartKey } from '@/modules/cart/application/queries'
import { ordersApi } from '../infrastructure/api'
import type { CreateOrderInput } from '../domain/types'

export function useCreateOrder() {
  const qc = useQueryClient()
  const cartKey = useCartKey()
  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersApi.create(input, idempotencyKeyFor(JSON.stringify(input))),
    onSuccess: (order) => {
      qc.setQueryData(['order', order.id], order)
    },
    onError: () => qc.invalidateQueries({ queryKey: cartKey }),
  })
}

/** Pedido pendente é consultado até virar terminal (confirmado/recusado); sobrevive a refresh. */
export function useOrder(id: string) {
  const qc = useQueryClient()
  const cartKey = useCartKey()
  return useQuery({
    queryKey: ['order', id],
    queryFn: async ({ signal }) => {
      const order = await ordersApi.get(id, signal)
      if (order.status !== 'pending') {
        clearIdempotencyKey()
        qc.invalidateQueries({ queryKey: cartKey })
        qc.invalidateQueries({ queryKey: ['nfts'] })
      }
      return order
    },
    refetchInterval: (q) => (q.state.data?.status === 'pending' ? 1000 : false),
    retry: (count, err) => (err as { response?: { status?: number } }).response?.status !== 404 && count < 3,
  })
}
