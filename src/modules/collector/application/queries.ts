import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionQuery } from '@/modules/identity/application/queries'
import { collectorApi } from '../infrastructure/api'

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: collectorApi.update,
    onSuccess: (user) => qc.setQueryData(sessionQuery.queryKey, user),
  })
}

export const useChangePassword = () => useMutation({ mutationFn: collectorApi.changePassword })
