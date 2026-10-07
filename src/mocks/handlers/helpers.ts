import { HttpResponse } from 'msw'
import { db, type DbUser } from '../db/db'
import { addEth, mulEth, pctEth, subEth } from '@/shared/kernel/money'
import type { Cart } from '@/modules/cart/domain/types'
import type { User } from '@/modules/identity/domain/types'

export const NETWORK_FEE = '0.016'
export const COUPONS: Record<string, { bp: number; expired?: boolean }> = {
  KURIO10: { bp: 1000 },
  BEMVINDO5: { bp: 500 },
  EXPIRADO: { bp: 1000, expired: true },
}

export function currentUser(request: Request): DbUser | null {
  const auth = request.headers.get('Authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  const id = token ? db().sessions[token] : null
  return id ? (db().users.find((u) => u.id === id) ?? null) : null
}

export function ownerKey(request: Request): string {
  return currentUser(request)?.id ?? request.headers.get('X-Guest-Id') ?? 'guest-anon'
}

export const publicUser = ({ salt: _s, hash: _h, ...u }: DbUser): User => u

export const unauthorized = () => HttpResponse.json({ code: 'UNAUTHORIZED', message: 'Sessão inválida ou expirada.' }, { status: 401 })
export const validation = (fields: Record<string, string>) =>
  HttpResponse.json({ code: 'VALIDATION', message: 'Verifique os campos informados.', fields }, { status: 422 })
export const notFound = (message = 'Recurso não encontrado.') => HttpResponse.json({ code: 'NOT_FOUND', message }, { status: 404 })

export function buildCart(key: string): Cart {
  const state = db().carts[key] ?? { items: [] }
  const items: Cart['items'] = []
  for (const it of state.items) {
    const nft = db().nfts.find((n) => n.id === it.nftId)
    if (!nft) continue
    const available = nft.editions.find((e) => e.label === it.edition)?.available ?? 0
    const quantity = Math.max(0, Math.min(it.quantity, available || it.quantity))
    items.push({
      nftId: nft.id,
      edition: it.edition,
      quantity,
      maxQuantity: available,
      unitPriceEth: nft.priceEth,
      lineTotalEth: mulEth(nft.priceEth, quantity),
      nft,
    })
  }
  const subtotal = items.reduce((acc, i) => addEth(acc, i.lineTotalEth), '0')
  const coupon = state.coupon ? COUPONS[state.coupon] : undefined
  const discount = coupon && !coupon.expired ? pctEth(subtotal, coupon.bp) : '0'
  const fee = items.length ? NETWORK_FEE : '0'
  return {
    items,
    couponCode: state.coupon,
    subtotalEth: subtotal,
    discountEth: discount,
    networkFeeEth: fee,
    totalEth: addEth(subEth(subtotal, discount), fee),
  }
}
