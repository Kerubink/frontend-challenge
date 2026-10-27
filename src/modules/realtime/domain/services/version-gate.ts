import type { NftUpdatedEvent } from '../events/nft-updated'

export type GateVerdict = 'apply' | 'duplicate' | 'stale'

/**
 * Porta de entrada das notícias: tolera duplicatas (mesmo id) e eventos antigos
 * (versão menor ou igual à já conhecida do recurso) sem regredir o estado.
 */
export function createVersionGate() {
  const seenIds = new Set<string>()
  const versions = new Map<string, number>()

  return {
    /** `known` é a versão já exibida em algum cache (ex.: o NFT do carrinho). */
    admit(event: NftUpdatedEvent, known = 0): GateVerdict {
      if (seenIds.has(event.id)) return 'duplicate'
      seenIds.add(event.id)
      const current = Math.max(known, versions.get(event.resource.id) ?? 0)
      if (event.version <= current) return 'stale'
      versions.set(event.resource.id, event.version)
      return 'apply'
    },
  }
}

export type VersionGate = ReturnType<typeof createVersionGate>
