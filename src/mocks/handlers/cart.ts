import { http, HttpResponse } from 'msw'
import { db, save } from '../db/db'
import { networkConditions } from '../network/conditions'
import { buildCart, COUPONS, currentUser, notFound, ownerKey } from './helpers'

function state(key: string) {
  return (db().carts[key] ??= { items: [] })
}

export const cartHandlers = [
  http.get('/api/cart', async ({ request }) => {
    await networkConditions()
    return HttpResponse.json(buildCart(ownerKey(request)))
  }),

  http.post('/api/cart/items', async ({ request }) => {
    await networkConditions()
    const key = ownerKey(request)
    const b = (await request.json()) as { nftId: string; edition: string; quantity: number }
    const nft = db().nfts.find((n) => n.id === b.nftId)
    if (!nft) return notFound('NFT não encontrado.')
    const available = nft.editions.find((e) => e.label === b.edition)?.available ?? 0
    if (available <= 0) return HttpResponse.json({ code: 'SOLD_OUT', message: 'Edição esgotada.' }, { status: 409 })
    const s = state(key)
    const found = s.items.find((i) => i.nftId === b.nftId && i.edition === b.edition)
    const next = (found?.quantity ?? 0) + Math.max(1, Math.floor(b.quantity || 1))
    if (next > available) {
      return HttpResponse.json({ code: 'LIMIT', message: `Limite de ${available} unidade(s) para esta edição.` }, { status: 409 })
    }
    if (found) found.quantity = next
    else s.items.push({ nftId: b.nftId, edition: b.edition, quantity: next })
    save()
    return HttpResponse.json(buildCart(key), { status: 201 })
  }),

  http.patch('/api/cart/items', async ({ request }) => {
    await networkConditions()
    const key = ownerKey(request)
    const b = (await request.json()) as { nftId: string; edition: string; quantity: number }
    const s = state(key)
    const item = s.items.find((i) => i.nftId === b.nftId && i.edition === b.edition)
    if (!item) return notFound('Item não está no carrinho.')
    const nft = db().nfts.find((n) => n.id === b.nftId)
    const available = nft?.editions.find((e) => e.label === b.edition)?.available ?? 0
    if (!Number.isInteger(b.quantity) || b.quantity < 1) return HttpResponse.json({ code: 'VALIDATION', message: 'Quantidade inválida.' }, { status: 422 })
    if (b.quantity > available) return HttpResponse.json({ code: 'LIMIT', message: `Limite de ${available} unidade(s) para esta edição.` }, { status: 409 })
    item.quantity = b.quantity
    save()
    return HttpResponse.json(buildCart(key))
  }),

  http.delete('/api/cart/items', async ({ request }) => {
    await networkConditions()
    const key = ownerKey(request)
    const p = new URL(request.url).searchParams
    const s = state(key)
    s.items = s.items.filter((i) => !(i.nftId === p.get('nftId') && i.edition === p.get('edition')))
    save()
    return HttpResponse.json(buildCart(key))
  }),

  http.post('/api/cart/coupon', async ({ request }) => {
    await networkConditions()
    const key = ownerKey(request)
    const { code } = (await request.json()) as { code: string }
    const c = COUPONS[(code ?? '').trim().toUpperCase()]
    if (!c) return HttpResponse.json({ code: 'COUPON_INVALID', message: 'Código promocional inválido.' }, { status: 422 })
    if (c.expired) return HttpResponse.json({ code: 'COUPON_EXPIRED', message: 'Este código promocional expirou.' }, { status: 410 })
    state(key).coupon = code.trim().toUpperCase()
    save()
    return HttpResponse.json(buildCart(key))
  }),

  http.delete('/api/cart/coupon', async ({ request }) => {
    await networkConditions()
    const key = ownerKey(request)
    state(key).coupon = undefined
    save()
    return HttpResponse.json(buildCart(key))
  }),

  // Preserva o carrinho do visitante ao autenticar.
  http.post('/api/cart/merge', async ({ request }) => {
    await networkConditions()
    const user = currentUser(request)
    if (!user) return HttpResponse.json({ code: 'UNAUTHORIZED', message: 'Sessão inválida.' }, { status: 401 })
    const { guestId } = (await request.json()) as { guestId: string }
    const guest = db().carts[guestId]
    if (guest?.items.length) {
      const mine = state(user.id)
      for (const g of guest.items) {
        const existing = mine.items.find((i) => i.nftId === g.nftId && i.edition === g.edition)
        if (existing) existing.quantity += g.quantity
        else mine.items.push({ ...g })
      }
      mine.coupon ??= guest.coupon
    }
    delete db().carts[guestId]
    save()
    return HttpResponse.json(buildCart(user.id))
  }),
]
