export type WalletKind = 'principal' | 'secundaria'
export type Network = 'Ethereum' | 'Polygon'

export interface Wallet {
  id: string
  label: string
  address: string
  network: Network
  kind: WalletKind
}

export type WalletInput = Omit<Wallet, 'id'>
