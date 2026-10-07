import { Link } from '@tanstack/react-router'
import { Card } from '@/shared/ui/shadcn/card'
import { Badge } from '@/shared/ui/shadcn/badge'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'
import { NftArt } from '@/shared/ui/NftArt'
import { Eth } from '@/shared/ui/Eth'
import { FavoriteButton } from '@/modules/favorites/presentation/components/FavoriteButton'
import type { Nft } from '../../domain/types'

export function NftCard({ nft }: { nft: Nft }) {
  const soldOut = nft.editions.every((e) => e.available === 0)
  return (
    <Card className="relative gap-3 overflow-hidden py-0">
      <div className="relative aspect-square">
        <Link to="/nfts/$nftId" params={{ nftId: nft.id }} aria-label={`Ver detalhes de ${nft.name}`} className="block size-full focus-visible:ring-2 focus-visible:ring-ring">
          <NftArt seed={nft.seed} alt={`Arte do NFT ${nft.name}`} />
        </Link>
        <div className="absolute top-2 right-2">
          <FavoriteButton nftId={nft.id} nftName={nft.name} />
        </div>
        {nft.rarity !== 'Comum' && (
          <Badge className="absolute top-2 left-2" variant="default">
            {nft.rarity.toUpperCase()}
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-1 px-4 pb-4">
        <Link to="/nfts/$nftId" params={{ nftId: nft.id }} className="font-medium hover:underline">
          {nft.name}
        </Link>
        <p className="text-xs text-muted-foreground">{nft.collection}</p>
        <div className="flex items-baseline gap-2">
          <Eth value={nft.priceEth} className="font-bold text-accent-foreground" />
          {nft.oldPriceEth && <Eth value={nft.oldPriceEth} className="text-sm text-brand-secondary line-through" />}
        </div>
        {soldOut && <Badge variant="outline">Esgotado</Badge>}
      </div>
    </Card>
  )
}

export function NftCardSkeleton() {
  return (
    <Card className="gap-3 overflow-hidden py-0" aria-hidden="true">
      <Skeleton className="aspect-square rounded-none" />
      <div className="flex flex-col gap-2 px-4 pb-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </Card>
  )
}
