import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/modules/identity/application/queries'
import { favoritesApi } from '../infrastructure/api'

export function useFavorites() {
  const { data: user } = useSession()
  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: favoritesApi.list,
    enabled: !!user,
  })
}

/** Atualização otimista com rollback em caso de falha. */
export function useToggleFavorite() {
  const qc = useQueryClient()
  const { data: user } = useSession()
  const key = ['favorites', user?.id]
  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) => (favorite ? favoritesApi.add(id) : favoritesApi.remove(id)),
    onMutate: async ({ id, favorite }) => {
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData<string[]>(key)
      qc.setQueryData<string[]>(key, (old = []) => (favorite ? [...new Set([...old, id])] : old.filter((x) => x !== id)))
      return { previous }
    },
    onError: (_e, _v, ctx) => qc.setQueryData(key, ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}
