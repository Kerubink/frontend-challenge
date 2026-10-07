import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/modules/identity/application/queries'
import { cartApi } from '../infrastructure/api'
import type { Cart } from '../domain/types'

export function useCartKey() {
  const { data: user } = useSession()
  return ['cart', user?.id ?? 'guest']
}

export function useCart() {
  return useQuery({ queryKey: useCartKey(), queryFn: cartApi.get, staleTime: 15_000 })
}

function useCartMutation<V>(fn: (v: V) => Promise<Cart>) {
  const qc = useQueryClient()
  const key = useCartKey()
  return useMutation({ mutationFn: fn, onSuccess: (cart) => qc.setQueryData(key, cart) })
}

export const useAddToCart = () => useCartMutation(cartApi.add)
export const useUpdateCartItem = () => useCartMutation(cartApi.update)
export const useRemoveCartItem = () => useCartMutation(cartApi.remove)
export const useApplyCoupon = () => useCartMutation(cartApi.applyCoupon)
export const useRemoveCoupon = () => useCartMutation(() => cartApi.removeCoupon())
