import { http, HttpResponse } from 'msw'
import { db } from '../db/db'
import { getScenario } from '../scenarios'
import { networkConditions } from '../network/conditions'
import { compareEth } from '@/shared/kernel/money'
import { notFound } from './helpers'
import type { NftPage } from '@/modules/catalog/domain/types'

const PAGE_SIZE = 9

export const catalogHandlers = [
  http.get('/api/nfts', async ({ request }) => {
    const failure = await networkConditions({ failIn: ['server-error'] })
    if (failure) return failure
    const p = new URL(request.url).searchParams
    const q = (p.get('q') ?? '').trim().toLowerCase()
    const collection = p.get('collection')
    const rarity = p.get('rarity')
    const min = p.get('minPrice')
    const max = p.get('maxPrice')
    const sort = p.get('sort') ?? 'recent'
    const page = Math.max(1, Number(p.get('page') ?? 1) || 1)

    const all = getScenario() === 'empty' ? [] : db().nfts
    const collections = Object.entries(
      all.reduce<Record<string, number>>((acc, n) => ({ ...acc, [n.collection]: (acc[n.collection] ?? 0) + 1 }), {}),
    ).map(([name, count]) => ({ name, count }))

    let list = all.filter(
      (n) =>
        (!q || n.name.toLowerCase().includes(q) || n.collection.toLowerCase().includes(q)) &&
        (!collection || n.collection === collection) &&
        (!rarity || n.rarity === rarity) &&
        (!min || compareEth(n.priceEth, min) >= 0) &&
        (!max || compareEth(n.priceEth, max) <= 0),
    )
    if (sort === 'price-asc') list = [...list].sort((a, b) => compareEth(a.priceEth, b.priceEth))
    else if (sort === 'price-desc') list = [...list].sort((a, b) => compareEth(b.priceEth, a.priceEth))
    else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    else list = [...list].reverse()

    const body: NftPage = {
      items: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
      total: list.length,
      page,
      pageSize: PAGE_SIZE,
      collections,
    }
    return HttpResponse.json(body)
  }),

  http.get('/api/nfts/featured', async () => {
    const failure = await networkConditions({ failIn: ['server-error'] })
    if (failure) return failure
    return HttpResponse.json(getScenario() === 'empty' ? [] : db().nfts.filter((n) => n.featured))
  }),

  http.get('/api/nfts/:id', async ({ params }) => {
    const failure = await networkConditions({ failIn: ['server-error'] })
    if (failure) return failure
    const nft = db().nfts.find((n) => n.id === params.id)
    return nft ? HttpResponse.json(nft) : notFound('NFT não encontrado.')
  }),
]
