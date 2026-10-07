export type Rarity = 'Comum' | 'Raro' | 'Épico'

export interface Edition {
  label: string
  available: number
}

export interface Nft {
  id: string
  name: string
  tokenId: string
  collection: string
  rarity: Rarity
  priceEth: string
  oldPriceEth?: string
  seed: number
  description: string
  attributes: string[]
  rating: number
  reviews: number
  editions: Edition[]
  network: string
  contract: string
  version: number
  featured: boolean
}

export type SortKey = 'recent' | 'price-asc' | 'price-desc' | 'name'

export interface NftFilters {
  q?: string
  collection?: string
  rarity?: Rarity
  minPrice?: string
  maxPrice?: string
  sort: SortKey
  page: number
}

export interface NftPage {
  items: Nft[]
  total: number
  page: number
  pageSize: number
  collections: { name: string; count: number }[]
}
