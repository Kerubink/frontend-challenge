import { formatEth } from '@/shared/kernel/money'

/** Cotação: valores calculados pela API para o carrinho naquele instante (referência para fechar o pedido). */
export interface QuoteLine {
  nftId: string
  name: string
  edition: string
  quantity: number
  /** Preço cotado (no Checkout é valor aceito, não o anunciado do Catálogo). */
  unitPriceEth: string
  available: boolean
}

export interface Quote {
  lines: QuoteLine[]
  couponCode?: string
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
}

const lineKey = (l: QuoteLine) => `${l.nftId}|${l.edition}`

/** Duas cotações são iguais quando nada que o colecionador aceitou mudou. */
export function sameQuote(a: Quote, b: Quote): boolean {
  if (
    a.couponCode !== b.couponCode ||
    a.subtotalEth !== b.subtotalEth ||
    a.discountEth !== b.discountEth ||
    a.networkFeeEth !== b.networkFeeEth ||
    a.totalEth !== b.totalEth ||
    a.lines.length !== b.lines.length
  ) {
    return false
  }
  const prev = new Map(a.lines.map((l) => [lineKey(l), l]))
  return b.lines.every((l) => {
    const p = prev.get(lineKey(l))
    return !!p && p.quantity === l.quantity && p.unitPriceEth === l.unitPriceEth && p.available === l.available
  })
}

/** Frases para avisar o que mudou entre a cotação aceita e a mais recente. */
export function describeQuoteChange(accepted: Quote, latest: Quote): string[] {
  const before = new Map(accepted.lines.map((l) => [lineKey(l), l]))
  const notes: string[] = []
  for (const l of latest.lines) {
    const p = before.get(lineKey(l))
    if (!p) continue
    if (p.available && !l.available) notes.push(`${l.name} (${l.edition}) não está mais disponível.`)
    else if (p.unitPriceEth !== l.unitPriceEth) notes.push(`O preço de ${l.name} mudou de ${formatEth(p.unitPriceEth)} para ${formatEth(l.unitPriceEth)}.`)
  }
  if (accepted.totalEth !== latest.totalEth) notes.push(`O total mudou de ${formatEth(accepted.totalEth)} para ${formatEth(latest.totalEth)}.`)
  else if (!notes.length) notes.push('Os valores do pedido mudaram.')
  return notes
}
