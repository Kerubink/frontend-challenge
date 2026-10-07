import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/modules/identity/application/queries'
import { walletsApi } from '../infrastructure/api'
import type { WalletInput } from '../domain/types'

export function useWallets() {
  const { data: user } = useSession()
  return useQuery({ queryKey: ['wallets', user?.id], queryFn: walletsApi.list, enabled: !!user })
}

export function useSaveWallet() {
  const qc = useQueryClient()
  const { data: user } = useSession()
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: WalletInput }) => (id ? walletsApi.update(id, input) : walletsApi.create(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets', user?.id] }),
  })
}
