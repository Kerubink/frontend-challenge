import { useState, type FormEvent } from 'react'
import { getRouteApi, Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'
import { Label } from '@/shared/ui/shadcn/label'
import { NativeSelect } from '@/shared/ui/shadcn/native-select'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'
import { Card } from '@/shared/ui/shadcn/card'
import { Alert } from '@/shared/ui/Alert'
import { NftArt } from '@/shared/ui/NftArt'
import { errorMessage } from '@/shared/infrastructure/http/client'
import { useFeaturedNfts, useNfts } from '../../application/queries'
import { NftCard, NftCardSkeleton } from '../components/NftCard'
import { normalizeHomeSearch, type HomeSearch, type HomeSearchInput } from './homeSearch'

const route = getRouteApi('/')

export function HomePage() {
  const search = normalizeHomeSearch(route.useSearch())
  const navigate = route.useNavigate()
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useNfts(search)
  const featured = useFeaturedNfts()
  const [q, setQ] = useState(search.q ?? '')
  const [min, setMin] = useState(search.minPrice ?? '')
  const [max, setMax] = useState(search.maxPrice ?? '')

  // Qualquer mudança de filtro reinicia a paginação.
  const update = (patch: Partial<HomeSearch>) => navigate({ search: (prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }) as HomeSearchInput })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    update({ q: q.trim() || undefined, minPrice: min || undefined, maxPrice: max || undefined })
  }
  const clear = () => {
    setQ('')
    setMin('')
    setMax('')
    navigate({ search: {} })
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1
  const hasFilters = !!(search.q || search.collection || search.rarity || search.minPrice || search.maxPrice)

  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="hero-title" className="grid items-center gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <p className="text-sm tracking-widest text-text-secondary">Bem-vindo à Kurio</p>
          <h1 id="hero-title" className="text-4xl font-bold md:text-5xl">
            SEJA DONO DO FUTURO DA ARTE DIGITAL
          </h1>
          <p className="text-text-secondary">Descubra NFTs selecionados de criadores do mundo todo, compre com sua carteira e acompanhe sua coleção.</p>
          <div>
            <Button asChild size="lg">
              <Link to="/" hash="catalogo">
                EXPLORAR
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3" aria-label="NFTs em destaque">
          {featured.isPending
            ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="aspect-square" />)
            : featured.data?.slice(0, 3).map((n) => (
                <Link key={n.id} to="/nfts/$nftId" params={{ nftId: n.id }} className="aspect-square overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-ring">
                  <NftArt seed={n.seed} alt={`Destaque: ${n.name}`} />
                </Link>
              ))}
        </div>
      </section>

      <section aria-labelledby="destaques">
        <h2 id="destaques" className="mb-4 border-b pb-2 text-lg font-bold">
          Destaques
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {featured.isPending
            ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="aspect-[3/4]" />)
            : featured.isError
              ? null
              : featured.data?.map((n) => (
                  <Link key={n.id} to="/nfts/$nftId" params={{ nftId: n.id }} className="flex flex-col gap-2 text-sm hover:underline">
                    <div className="aspect-square overflow-hidden rounded-xl">
                      <NftArt seed={n.seed} alt={`Arte do NFT ${n.name}`} />
                    </div>
                    <span className="truncate">{n.name}</span>
                  </Link>
                ))}
        </div>
        {featured.isError && <Alert tone="error">Não foi possível carregar os destaques.</Alert>}
        {featured.data?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum destaque disponível.</p>}
      </section>

      <section id="catalogo" aria-labelledby="catalogo-title" className="grid scroll-mt-8 gap-8 lg:grid-cols-[18rem_1fr]">
        <h2 id="catalogo-title" className="sr-only">
          Catálogo
        </h2>
        <aside aria-label="Filtros">
          <Card className="gap-5 p-5">
            <form onSubmit={onSubmit} className="flex flex-col gap-4" role="search">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="busca">Buscar</Label>
                <div className="flex gap-2">
                  <Input id="busca" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome ou coleção" />
                  <Button type="submit" size="icon" aria-label="Buscar">
                    <Search />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="raridade">Raridade</Label>
                <NativeSelect id="raridade" value={search.rarity ?? ''} onChange={(e) => update({ rarity: (e.target.value || undefined) as HomeSearch['rarity'] })}>
                  <option value="">Todas</option>
                  <option value="Comum">Comum</option>
                  <option value="Raro">Raro</option>
                  <option value="Épico">Épico</option>
                </NativeSelect>
              </div>
              <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1.5 text-sm font-medium">Faixa de preço (ETH)</legend>
                <div className="grid grid-cols-2 gap-2">
                  <Input aria-label="Preço mínimo" inputMode="decimal" placeholder="Mín." value={min} onChange={(e) => setMin(e.target.value)} />
                  <Input aria-label="Preço máximo" inputMode="decimal" placeholder="Máx." value={max} onChange={(e) => setMax(e.target.value)} />
                </div>
                <Button type="submit" variant="outline" size="sm">
                  Aplicar
                </Button>
              </fieldset>
            </form>
            <div>
              <h3 className="mb-2 text-sm font-bold">Coleções</h3>
              <ul className="flex flex-col gap-1 text-sm">
                <li>
                  <button type="button" aria-pressed={!search.collection} className={`w-full rounded px-2 py-1 text-left hover:bg-accent ${!search.collection ? 'text-accent-foreground' : 'text-text-secondary'}`} onClick={() => update({ collection: undefined })}>
                    Todas
                  </button>
                </li>
                {data?.collections.map((c) => (
                  <li key={c.name}>
                    <button
                      type="button"
                      aria-pressed={search.collection === c.name}
                      className={`flex w-full justify-between rounded px-2 py-1 text-left hover:bg-accent ${search.collection === c.name ? 'text-accent-foreground' : 'text-text-secondary'}`}
                      onClick={() => update({ collection: c.name })}
                    >
                      <span>{c.name}</span>
                      <span className="font-bold">{c.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {hasFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={clear}>
                Limpar filtros
              </Button>
            )}
          </Card>
        </aside>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p role="status" aria-live="polite" className="text-sm text-text-secondary">
              {isPending ? 'Carregando NFTs…' : isError ? '' : `${data.total} ${data.total === 1 ? 'resultado' : 'resultados'}`}
              {isFetching && !isPending && ' · atualizando…'}
            </p>
            <div className="flex items-center gap-2">
              <Label htmlFor="ordenar">Ordenar por</Label>
              <NativeSelect id="ordenar" className="w-48" value={search.sort} onChange={(e) => update({ sort: e.target.value as HomeSearch['sort'] })}>
                <option value="recent">Listados recentemente</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="name">Nome (A–Z)</option>
              </NativeSelect>
            </div>
          </div>

          {isError ? (
            <div className="flex flex-col items-start gap-3">
              <Alert tone="error">{errorMessage(error)}</Alert>
              <Button variant="outline" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : isPending ? (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3" aria-busy="true">
              {Array.from({ length: 6 }, (_, i) => (
                <NftCardSkeleton key={i} />
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-xl border p-8">
              <p className="font-medium">Nenhum NFT encontrado.</p>
              <p className="text-sm text-text-secondary">Ajuste a busca ou os filtros para ver resultados.</p>
              {hasFilters && (
                <Button variant="outline" onClick={clear}>
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className={`grid grid-cols-2 gap-4 xl:grid-cols-3 ${isPlaceholderData ? 'opacity-60' : ''}`} aria-busy={isFetching}>
              {data.items.map((n) => (
                <NftCard key={n.id} nft={n} />
              ))}
            </div>
          )}

          {data && totalPages > 1 && (
            <nav aria-label="Paginação" className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" disabled={search.page <= 1} onClick={() => update({ page: search.page - 1 })}>
                <ChevronLeft /> Anterior
              </Button>
              <span className="text-sm" aria-current="page">
                Página {data.page} de {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={search.page >= totalPages} onClick={() => update({ page: search.page + 1 })}>
                Próxima <ChevronRight />
              </Button>
            </nav>
          )}
        </div>
      </section>
    </div>
  )
}
