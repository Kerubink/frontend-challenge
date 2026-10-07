import { formatEth } from '@/shared/kernel/money'

export function Eth({ value, className }: { value: string; className?: string }) {
  return <span className={className}>{formatEth(value)}</span>
}
