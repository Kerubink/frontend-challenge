import type { Nft } from '@/modules/catalog/domain/types'

export interface CartItem {
  nftId: string
  edition: string
  quantity: number
  maxQuantity: number
  unitPriceEth: string
  lineTotalEth: string
  nft: Nft
}

export interface Cart {
  items: CartItem[]
  couponCode?: string
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
}
