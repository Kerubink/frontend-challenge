import { cn } from '@/shared/lib/cn'

const artworks = Object.entries(import.meta.glob<string>('@/assets/images/nft-*.webp', { eager: true, import: 'default' }))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url)

/**
 * Arte do NFT (assets exportados do Figma). A imagem é escolhida de forma
 * determinística a partir do `seed`, então o mesmo NFT sempre exibe a mesma arte.
 */
export function NftArt({ seed, alt, variant = 0, className }: { seed: number; alt: string; variant?: number; className?: string }) {
  const src = artworks[(seed + variant) % artworks.length]
  return <img src={src} alt={alt} width={640} height={640} loading="lazy" decoding="async" className={cn('block size-full object-cover', className)} />
}
