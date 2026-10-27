import { useEffect, useState } from 'react'
import type { Cart } from '@/modules/cart/domain/types'
import { describeQuoteChange, sameQuote, type Quote } from '../../domain/value-objects/quote'

export function toQuote(cart: Cart): Quote {
  return {
    lines: cart.items.map((i) => ({
      nftId: i.nftId,
      name: i.nft.name,
      edition: i.edition,
      quantity: i.quantity,
      unitPriceEth: i.unitPriceEth,
      available: i.maxQuantity > 0,
    })),
    couponCode: cart.couponCode,
    subtotalEth: cart.subtotalEth,
    discountEth: cart.discountEth,
    networkFeeEth: cart.networkFeeEth,
    totalEth: cart.totalEth,
  }
}

/**
 * Guarda a cotação que o colecionador viu e aceitou. A cotação mais recente (carrinho vindo da API)
 * só vale para fechar o pedido depois de aceita de novo: enquanto diferir, `stale` é verdadeiro.
 */
export function useQuoteAcceptance(cart: Cart | undefined) {
  const [accepted, setAccepted] = useState<Quote | null>(null)
  const latest = cart ? toQuote(cart) : null

  useEffect(() => {
    if (latest && !accepted) setAccepted(latest)
  }, [latest, accepted])

  const stale = !!(accepted && latest && !sameQuote(accepted, latest))
  return {
    /** Cotação aceita (base do `expectedTotalEth` enviado ao pedido). */
    accepted,
    stale,
    changes: accepted && latest && stale ? describeQuoteChange(accepted, latest) : [],
    acceptLatest: () => {
      if (latest) setAccepted(latest)
    },
  }
}
