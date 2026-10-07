import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { catalogApi } from '../infrastructure/api'
import type { NftFilters } from '../domain/types'

export const useNfts = (filters: NftFilters) =>
  useQuery({
    queryKey: ['nfts', filters],
    queryFn: ({ signal }) => catalogApi.list(filters, signal),
    placeholderData: keepPreviousData, // mantém a lista anterior enquanto a nova carrega
    staleTime: 30_000,
  })

export const useFeaturedNfts = () => useQuery({ queryKey: ['nfts', 'featured'], queryFn: catalogApi.featured, staleTime: 60_000 })

export const useNft = (id: string) =>
  useQuery({
    queryKey: ['nft', id],
    queryFn: ({ signal }) => catalogApi.get(id, signal),
    retry: (count, err) => (err as { response?: { status?: number } }).response?.status !== 404 && count < 2,
  })
