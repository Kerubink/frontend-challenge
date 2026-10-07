import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiError, clearGuestId, guestId, tokenStore } from '@/shared/infrastructure/http/client'
import { identityApi } from '../infrastructure/api'
import { cartApi } from '@/modules/cart/infrastructure/api'
import type { AuthResult, User } from '../domain/types'

export const sessionQuery = queryOptions({
  queryKey: ['session'],
  staleTime: 60_000,
  retry: false,
  queryFn: async (): Promise<User | null> => {
    if (!tokenStore.get()) return null
    try {
      return await identityApi.session()
    } catch (e) {
      if (apiError(e).status === 401) {
        tokenStore.clear()
        return null
      }
      throw e
    }
  },
})

export const useSession = () => useQuery(sessionQuery)

/** Após autenticar: guarda o token, limpa cache do visitante e preserva o carrinho dele. */
function useAfterAuth() {
  const qc = useQueryClient()
  return async (result: AuthResult) => {
    const guest = guestId()
    tokenStore.set(result.token)
    qc.clear()
    qc.setQueryData(sessionQuery.queryKey, result.user)
    try {
      await cartApi.merge(guest)
    } catch {
      /* o carrinho do visitante permanece no servidor; não bloqueia o login */
    }
    clearGuestId()
  }
}

export function useLogin() {
  const after = useAfterAuth()
  return useMutation({ mutationFn: identityApi.login, onSuccess: after })
}

export function useRegister() {
  const after = useAfterAuth()
  return useMutation({ mutationFn: identityApi.register, onSuccess: after })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: identityApi.logout,
    onSettled: () => {
      tokenStore.clear()
      qc.clear()
      qc.setQueryData(sessionQuery.queryKey, null)
    },
  })
}
