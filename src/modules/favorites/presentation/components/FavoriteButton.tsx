import { Link, useLocation } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { Button } from '@/shared/ui/shadcn/button'
import { useSession } from '@/modules/identity/application/queries'
import { useFavorites, useToggleFavorite } from '../../application/queries'
import { cn } from '@/shared/lib/cn'

export function FavoriteButton({ nftId, nftName, withLabel = false }: { nftId: string; nftName: string; withLabel?: boolean }) {
  const { data: user } = useSession()
  const { data: favorites } = useFavorites()
  const toggle = useToggleFavorite()
  const location = useLocation()
  const active = !!favorites?.includes(nftId)

  const content = (
    <>
      <Heart className={cn(active && 'fill-current')} />
      {withLabel && <span>{active ? 'Favoritado' : 'Favoritar'}</span>}
    </>
  )

  if (!user) {
    return (
      <Button asChild variant={withLabel ? 'outline' : 'secondary'} size={withLabel ? 'default' : 'icon'} aria-label={`Entrar para favoritar ${nftName}`}>
        <Link to="/login" search={{ redirect: location.href }}>
          {content}
        </Link>
      </Button>
    )
  }
  return (
    <Button
      type="button"
      variant={withLabel ? 'outline' : 'secondary'}
      size={withLabel ? 'default' : 'icon'}
      aria-pressed={active}
      aria-label={withLabel ? undefined : `${active ? 'Remover dos' : 'Adicionar aos'} favoritos: ${nftName}`}
      onClick={() => toggle.mutate({ id: nftId, favorite: !active })}
    >
      {content}
    </Button>
  )
}
