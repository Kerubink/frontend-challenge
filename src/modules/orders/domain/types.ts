export type OrderStatus = 'pending' | 'confirmed' | 'declined'

export interface OrderLine {
  nftId: string
  name: string
  tokenId: string
  edition: string
  quantity: number
  seed: number
  unitPriceEth: string
  lineTotalEth: string
}

/** Snapshot imutável: alterações posteriores no catálogo não afetam o recibo. */
export interface Order {
  id: string
  status: OrderStatus
  txHash: string
  createdAt: string
  lines: OrderLine[]
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
  wallet: { label: string; address: string }
  network: string
  declineReason?: string
}

export interface CheckoutProfile {
  displayName: string
  username: string
  email: string
  note?: string
}

export interface CreateOrderInput {
  walletId: string
  network: string
  profile: CheckoutProfile
  expectedTotalEth: string
}
