export const NFT_UPDATED = 'nft.updated'

/** Evento `nft.updated`: id estável, recurso afetado e versão (README §7). */
export interface NftUpdatedEvent {
  id: string
  resource: { type: 'nft'; id: string }
  version: number
  occurredAt: string
  data: {
    priceEth: string
    editions: { label: string; available: number }[]
  }
}
