import type { Nft, Rarity } from '@/modules/catalog/domain/types'

const COLLECTIONS = ['Kurio Apes', 'Violet Nomads', 'Ivory Barons', 'Golden Beats', 'Cosmic Blooms', 'Golden Signals']
const NAMES = ['Emerald Ape', 'Violet Nomad', 'Ivory Baron', 'Golden Beat', 'Cosmic Bloom', 'Golden Signal']
const RARITIES: Rarity[] = ['Comum', 'Raro', 'Épico']
const ATTRS = ['Óculos', 'Esmeralda', 'Raro', 'Neon', 'Aurora', 'Vintage', 'Cristal', 'Sombra']

// PRNG determinístico: mesmas fixtures a cada reset.
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function build(): Nft[] {
  const r = rng(42)
  return Array.from({ length: 36 }, (_, i) => {
    const ci = i % COLLECTIONS.length
    const rarity = RARITIES[Math.floor(r() * 3)]
    const cents = 30 + Math.floor(r() * 290)
    const price = `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`
    const number = Math.floor(r() * 900) + 1
    const tokenNumber = i + 1
    const stock = (i * 7) % 11 === 0 ? 0 : 2 + Math.floor(r() * 8)
    const hasOld = i % 5 === 0
    return {
      id: `nft-${String(tokenNumber).padStart(3, '0')}`,
      name: `${NAMES[ci]} #${String(number).padStart(3, '0')}`,
      tokenId: `#${String(tokenNumber).padStart(4, '0')}`,
      collection: COLLECTIONS[ci],
      rarity,
      priceEth: price,
      oldPriceEth: hasOld ? `${Math.floor(cents / 100) + 1}.${String(cents % 100).padStart(2, '0')}` : undefined,
      seed: tokenNumber * 13,
      description: `Peça digital da coleção ${COLLECTIONS[ci]}. Arte gerada de forma procedural, com autenticidade registrada na rede e direitos de uso pessoal transferidos ao colecionador.`,
      attributes: [ATTRS[i % ATTRS.length], ATTRS[(i + 3) % ATTRS.length], rarity],
      rating: 4 + Math.round(r() * 10) / 10,
      reviews: 3 + Math.floor(r() * 40),
      editions: [
        { label: '1/1', available: i % 9 === 0 ? 1 : 0 },
        { label: '1/10', available: stock > 0 ? Math.min(stock, 5) : 0 },
        { label: '1/50', available: stock },
      ],
      network: i % 2 === 0 ? 'Ethereum' : 'Polygon',
      contract: `0x${(tokenNumber * 2654435761).toString(16).padStart(8, '0')}…E82C`,
      version: 1,
      featured: i < 6,
    }
  })
}

export const NFT_FIXTURES: Nft[] = build()
export const COLLECTION_NAMES = COLLECTIONS
