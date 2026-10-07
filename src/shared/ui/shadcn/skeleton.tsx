import * as React from 'react'
import { cn } from '@/shared/lib/cn'

/** Skeleton com shimmer; passe dimensões reais para evitar layout shift. */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div aria-hidden="true" className={cn('skeleton rounded-md', className)} {...props} />
}
export { Skeleton }
