/**
 * ETH trafega como string decimal e é calculado com BigInt (18 casas) — nunca float.
 */
const DECIMALS = 18
const SCALE = 10n ** BigInt(DECIMALS)

export function toWei(value: string): bigint {
  const [int = '0', frac = ''] = value.trim().split('.')
  const padded = (frac + '0'.repeat(DECIMALS)).slice(0, DECIMALS)
  return BigInt(int || '0') * SCALE + BigInt(padded || '0')
}

export function fromWei(wei: bigint): string {
  const negative = wei < 0n
  const abs = negative ? -wei : wei
  const int = abs / SCALE
  const frac = (abs % SCALE).toString().padStart(DECIMALS, '0').replace(/0+$/, '')
  const out = frac ? `${int}.${frac}` : `${int}`
  return negative ? `-${out}` : out
}

export const addEth = (a: string, b: string) => fromWei(toWei(a) + toWei(b))
export const subEth = (a: string, b: string) => fromWei(toWei(a) - toWei(b))
export const mulEth = (a: string, qty: number) => fromWei(toWei(a) * BigInt(qty))
/** percent em pontos-base inteiros (ex.: 10% = 1000). */
export const pctEth = (a: string, basisPoints: number) => fromWei((toWei(a) * BigInt(basisPoints)) / 10000n)
export const isValidEth = (v: string) => /^\d+(\.\d{1,18})?$/.test(v.trim())
export const compareEth = (a: string, b: string) => {
  const d = toWei(a) - toWei(b)
  return d === 0n ? 0 : d < 0n ? -1 : 1
}

/** Apresentação: mínimo de 2 casas, sem zeros à direita além disso (1.19, 0.016, 26.846). */
export function formatEth(value: string, withUnit = true): string {
  const [int, frac = ''] = value.split('.')
  const trimmed = frac.replace(/0+$/, '')
  const shown = trimmed.length < 2 ? trimmed.padEnd(2, '0') : trimmed
  return `${int}.${shown}${withUnit ? ' ETH' : ''}`
}
