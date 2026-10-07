import { http, HttpResponse } from 'msw'
import { db, sha256, save, type StoredOrder } from '../db/db'
import { getScenario } from '../scenarios'
import { networkConditions } from '../network/conditions'
import { buildCart, currentUser, notFound, unauthorized, validation } from './helpers'
import type { CreateOrderInput } from '@/modules/orders/domain/types'

const CONFIRM_AFTER_MS = 1800

function publicOrder({ ownerId: _o, createdMs: _c, ...order }: StoredOrder) {
  return order
}

/** Resolve o pedido pendente (estado terminal depois de resolvido). */
function settle(order: StoredOrder) {
  if (order.status !== 'pending' || Date.now() - order.createdMs < CONFIRM_AFTER_MS) return
  if (getScenario() === 'payment-declined') {
    order.status = 'declined'
    order.declineReason = 'Pagamento recusado pela carteira.'
  } else {
    order.status = 'confirmed'
    // Só os itens/quantidades comprados saem do carrinho.
    const cart = db().carts[order.ownerId]
    for (const line of order.lines) {
      const nft = db().nfts.find((n) => n.id === line.nftId)
      const ed = nft?.editions.find((e) => e.label === line.edition)
      if (ed) ed.available = Math.max(0, ed.available - line.quantity)
      if (cart) {
        const it = cart.items.find((i) => i.nftId === line.nftId && i.edition === line.edition)
        if (it) it.quantity -= line.quantity
        cart.items = cart.items.filter((i) => i.quantity > 0)
      }
    }
    if (cart && !cart.items.length) cart.coupon = undefined
  }
  save()
}

export const orderHandlers = [
  http.post('/api/orders', async ({ request }) => {
    await networkConditions()
    const user = currentUser(request)
    if (!user) return unauthorized()
    const idemKey = request.headers.get('Idempotency-Key')
    if (!idemKey) return HttpResponse.json({ code: 'IDEMPOTENCY_KEY_REQUIRED', message: 'Chave de idempotência ausente.' }, { status: 400 })

    const raw = await request.text()
    const bodyHash = await sha256(raw)
    const existing = db().idempotency[`${user.id}:${idemKey}`]
    if (existing) {
      if (existing.hash !== bodyHash) {
        return HttpResponse.json({ code: 'IDEMPOTENCY_CONFLICT', message: 'Chave já utilizada com conteúdo diferente.' }, { status: 409 })
      }
      const prev = db().orders[existing.orderId]
      settle(prev)
      return HttpResponse.json(publicOrder(prev), { status: 200 })
    }

    const b = JSON.parse(raw) as CreateOrderInput
    const fields: Record<string, string> = {}
    if (!b.profile?.displayName?.trim()) fields.displayName = 'Informe o nome de exibição.'
    if (!b.profile?.username?.trim()) fields.username = 'Informe o nome de usuário.'
    if (!b.profile?.email || !/^\S+@\S+\.\S+$/.test(b.profile.email)) fields.email = 'E-mail inválido.'
    if (!b.network) fields.network = 'Selecione uma rede.'
    const wallet = (db().wallets[user.id] ?? []).find((w) => w.id === b.walletId)
    if (!wallet) fields.walletId = 'Selecione uma carteira cadastrada.'
    if (Object.keys(fields).length) return validation(fields)

    const cart = buildCart(user.id)
    if (!cart.items.length) return HttpResponse.json({ code: 'EMPTY_CART', message: 'Seu carrinho está vazio.' }, { status: 409 })
    const soldOut = cart.items.find((i) => i.quantity > i.maxQuantity || i.maxQuantity === 0)
    if (soldOut) {
      return HttpResponse.json({ code: 'OUT_OF_STOCK', message: `${soldOut.nft.name} (${soldOut.edition}) não está mais disponível.`, cart }, { status: 409 })
    }
    if (cart.totalEth !== b.expectedTotalEth) {
      return HttpResponse.json({ code: 'QUOTE_CHANGED', message: 'Os valores mudaram. Revise o pedido antes de confirmar.', cart }, { status: 409 })
    }

    const id = `ord-${crypto.randomUUID().slice(0, 8)}`
    const order: StoredOrder = {
      id,
      ownerId: user.id,
      createdMs: Date.now(),
      status: 'pending',
      txHash: `0x${(await sha256(id)).slice(0, 40)}`,
      createdAt: new Date().toISOString(),
      lines: cart.items.map((i) => ({
        nftId: i.nftId,
        name: i.nft.name,
        tokenId: i.nft.tokenId,
        edition: i.edition,
        quantity: i.quantity,
        seed: i.nft.seed,
        unitPriceEth: i.unitPriceEth,
        lineTotalEth: i.lineTotalEth,
      })),
      subtotalEth: cart.subtotalEth,
      discountEth: cart.discountEth,
      networkFeeEth: cart.networkFeeEth,
      totalEth: cart.totalEth,
      wallet: { label: wallet!.label, address: wallet!.address },
      network: b.network,
    }
    db().orders[id] = order
    db().idempotency[`${user.id}:${idemKey}`] = { hash: bodyHash, orderId: id }
    save()
    return HttpResponse.json(publicOrder(order), { status: 201 })
  }),

  http.get('/api/orders/:id', async ({ request, params }) => {
    await networkConditions()
    const user = currentUser(request)
    if (!user) return unauthorized()
    const order = db().orders[params.id as string]
    if (!order || order.ownerId !== user.id) return notFound('Pedido não encontrado.')
    settle(order)
    return HttpResponse.json(publicOrder(order))
  }),
]
