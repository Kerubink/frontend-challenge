import type { QueryClient } from '@tanstack/react-query'
import type { NftUpdatedEvent } from '../../domain/events/nft-updated'
import type { VersionGate } from '../../domain/services/version-gate'

interface CachedNft {
  version?: number
}
interface CachedCart {
  items?: { nftId: string; nft?: CachedNft }[]
}

const cachedCarts = (qc: QueryClient) => qc.getQueriesData<CachedCart>({ queryKey: ['cart'] })

/** Maior versão do NFT já exibida em algum cache (carrinho ou detalhe). */
function knownVersion(qc: QueryClient, nftId: string): number {
  let known = qc.getQueryData<CachedNft>(['nft', nftId])?.version ?? 0
  for (const [, cart] of cachedCarts(qc)) {
    for (const item of cart?.items ?? []) if (item.nftId === nftId) known = Math.max(known, item.nft?.version ?? 0)
  }
  return known
}

const cartHas = (qc: QueryClient, nftId: string) => cachedCarts(qc).some(([, cart]) => cart?.items?.some((i) => i.nftId === nftId))

/**
 * Aplica `nft.updated`: duplicado/antigo é ignorado antes de qualquer efeito.
 * Se vale, a cotação é buscada de novo na API (ela é a referência) em vez de recalculada no cliente.
 */
export function applyNftUpdated(qc: QueryClient, gate: VersionGate, event: NftUpdatedEvent): boolean {
  const verdict = gate.admit(event, knownVersion(qc, event.resource.id))
  if (verdict !== 'apply') {
    console.debug(`[realtime] nft.updated ignorado (${verdict})`, event.id)
    return false
  }
  void qc.invalidateQueries({ queryKey: ['nft', event.resource.id] })
  void qc.invalidateQueries({ queryKey: ['nfts'] })
  if (cartHas(qc, event.resource.id)) void qc.invalidateQueries({ queryKey: ['cart'] })
  return true
}

/** Após reconexão: eventos podem ter sido perdidos; reconcilia os recursos ativos via REST. */
export function reconcileActiveResources(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: ['cart'] })
  void qc.invalidateQueries({ queryKey: ['nft'] })
  void qc.invalidateQueries({ queryKey: ['nfts'] })
}
