import { useState } from 'react'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { Minus, Plus, Star } from 'lucide-react'
import { Button } from '@/shared/ui/shadcn/button'
import { Badge } from '@/shared/ui/shadcn/badge'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'
import { Separator } from '@/shared/ui/shadcn/separator'
import { Alert } from '@/shared/ui/Alert'
import { NftArt } from '@/shared/ui/NftArt'
import { Eth } from '@/shared/ui/Eth'
import { apiError, errorMessage } from '@/shared/infrastructure/http/client'
import { useAddToCart, useCart } from '@/modules/cart/application/queries'
import { FavoriteButton } from '@/modules/favorites/presentation/components/FavoriteButton'
import { useNft, useNfts } from '../../application/queries'
import { NftCard } from '../components/NftCard'
import type { Nft } from '../../domain/types'

const route = getRouteApi('/nfts/$nftId')

function DetailSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2" aria-busy="true" aria-label="Carregando NFT">
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  )
}

function Detail({ nft }: { nft: Nft }) {
  const navigate = useNavigate()
  const add = useAddToCart()
  const { data: cart } = useCart()
  const firstAvailable = nft.editions.find((e) => e.available > 0)?.label
  const [edition, setEdition] = useState(firstAvailable ?? nft.editions[0].label)
  const [qty, setQty] = useState(1)
  const [variant, setVariant] = useState(0)
  const [message, setMessage] = useState<string | null>(null)

  const selected = nft.editions.find((e) => e.label === edition)!
  const inCart = cart?.items.find((i) => i.nftId === nft.id && i.edition === edition)?.quantity ?? 0
  const remaining = Math.max(0, selected.available - inCart)
  const unavailable = selected.available === 0

  const related = useNfts({ collection: nft.collection, sort: 'recent', page: 1 })

  const submit = (goToCart: boolean) => {
    setMessage(null)
    add.mutate(
      { nftId: nft.id, edition, quantity: qty },
      {
        onSuccess: () => (goToCart ? navigate({ to: '/cart' }) : setMessage('Adicionado ao carrinho.')),
      },
    )
  }

  return (
    <div className="flex flex-col gap-12">
      <nav aria-label="Você está em" className="text-sm font-bold">
        <Link to="/" className="hover:underline">Início</Link> / <Link to="/" hash="catalogo" className="hover:underline">Mercado</Link> / <span aria-current="page">{nft.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="aspect-square overflow-hidden rounded-xl border bg-card p-3">
            <div className="size-full overflow-hidden rounded-lg">
              <NftArt seed={nft.seed} variant={variant} alt={`Arte principal de ${nft.name}`} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3" role="group" aria-label="Galeria">
            {[0, 1, 2, 3].map((v) => (
              <button key={v} type="button" aria-pressed={variant === v} aria-label={`Ver imagem ${v + 1}`} onClick={() => setVariant(v)} className={`aspect-square overflow-hidden rounded-lg border ${variant === v ? 'border-primary' : ''}`}>
                <NftArt seed={nft.seed} variant={v} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h1 className="text-3xl font-bold">{nft.name}</h1>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-3">
              <Eth value={nft.priceEth} className="text-2xl font-bold text-accent-foreground" />
              {nft.oldPriceEth && <Eth value={nft.oldPriceEth} className="text-brand-secondary line-through" />}
            </div>
            <p className="flex items-center gap-1 text-sm">
              <Star className="size-4 fill-current text-text-accent" aria-hidden="true" />
              <span>{nft.rating.toFixed(1)}</span>
              <span className="text-text-secondary">({nft.reviews} avaliações)</span>
            </p>
          </div>
          <Separator />
          <section aria-labelledby="sobre">
            <h2 id="sobre" className="mb-2 font-bold">Sobre este NFT:</h2>
            <p className="text-sm text-text-secondary">{nft.description}</p>
          </section>

          <fieldset>
            <legend className="mb-2 font-bold">Edição:</legend>
            <div className="flex flex-wrap gap-2">
              {nft.editions.map((e) => (
                <Button
                  key={e.label}
                  type="button"
                  size="sm"
                  variant={edition === e.label ? 'outline' : 'ghost'}
                  aria-pressed={edition === e.label}
                  disabled={e.available === 0}
                  onClick={() => {
                    setEdition(e.label)
                    setQty(1)
                  }}
                >
                  {e.label}
                  {e.available === 0 ? ' · esgotada' : ` · ${e.available} disp.`}
                </Button>
              ))}
            </div>
          </fieldset>

          {unavailable && <Alert tone="error">Esta edição está indisponível no momento.</Alert>}

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3" role="group" aria-label="Quantidade">
              <Button type="button" size="icon" variant="outline" aria-label="Diminuir quantidade" disabled={qty <= 1 || unavailable} onClick={() => setQty((q) => q - 1)}>
                <Minus />
              </Button>
              <span aria-live="polite" className="w-6 text-center">{qty}</span>
              <Button type="button" size="icon" variant="outline" aria-label="Aumentar quantidade" disabled={qty >= remaining || unavailable} onClick={() => setQty((q) => q + 1)}>
                <Plus />
              </Button>
            </div>
            {!unavailable && qty >= remaining && <p className="text-xs text-text-secondary">Limite de {selected.available} unidade(s) para esta edição{inCart > 0 && ` (${inCart} já no carrinho)`}.</p>}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" disabled={unavailable || remaining === 0 || add.isPending} onClick={() => submit(true)}>
              COMPRAR
            </Button>
            <Button size="lg" variant="secondary" disabled={unavailable || remaining === 0 || add.isPending} onClick={() => submit(false)}>
              Adicionar ao carrinho
            </Button>
            <FavoriteButton nftId={nft.id} nftName={nft.name} withLabel />
          </div>
          {add.isError && <Alert tone="error">{errorMessage(add.error)}</Alert>}
          {message && <Alert tone="success">{message}</Alert>}

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-brand-secondary">
            <dt>ID do token:</dt><dd>{nft.tokenId}</dd>
            <dt>Coleção:</dt><dd>{nft.collection}</dd>
            <dt>Atributos:</dt><dd>{nft.attributes.join(', ')}</dd>
            <dt>Rede:</dt><dd>{nft.network}</dd>
            <dt>Contrato:</dt><dd>{nft.contract}</dd>
          </dl>
          <Badge variant="outline" className="w-fit">{nft.rarity}</Badge>
        </div>
      </div>

      <section aria-labelledby="mais">
        <h2 id="mais" className="mb-4 border-b pb-2 text-lg font-bold text-accent-foreground">Mais desta coleção</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {related.data?.items.filter((n) => n.id !== nft.id).slice(0, 4).map((n) => <NftCard key={n.id} nft={n} />)}
        </div>
      </section>
    </div>
  )
}

export function NftDetailPage() {
  const { nftId } = route.useParams()
  const { data, isPending, isError, error, refetch } = useNft(nftId)

  if (isPending) return <DetailSkeleton />
  if (isError) {
    const notFound = apiError(error).status === 404
    return (
      <div className="flex flex-col items-start gap-4 py-8">
        <h1 className="text-2xl font-bold">{notFound ? 'NFT não encontrado' : 'Não foi possível carregar o NFT'}</h1>
        <p className="text-text-secondary">{notFound ? 'O NFT que você procura não existe ou foi removido.' : errorMessage(error)}</p>
        <div className="flex gap-3">
          {!notFound && <Button variant="outline" onClick={() => refetch()}>Tentar novamente</Button>}
          <Button asChild><Link to="/">Voltar ao mercado</Link></Button>
        </div>
      </div>
    )
  }
  return <Detail key={data.id} nft={data} />
}
