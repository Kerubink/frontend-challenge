import { http } from '@/shared/infrastructure/http/client'
import type { Nft, NftFilters, NftPage } from '../domain/types'

export const catalogApi = {
  list: (f: NftFilters, signal?: AbortSignal) =>
    http
      .get<NftPage>('/nfts', {
        signal,
        params: {
          q: f.q || undefined,
          collection: f.collection || undefined,
          rarity: f.rarity || undefined,
          minPrice: f.minPrice || undefined,
          maxPrice: f.maxPrice || undefined,
          sort: f.sort,
          page: f.page,
        },
      })
      .then((r) => r.data),
  featured: () => http.get<Nft[]>('/nfts/featured').then((r) => r.data),
  get: (id: string, signal?: AbortSignal) => http.get<Nft>(`/nfts/${id}`, { signal }).then((r) => r.data),
}
