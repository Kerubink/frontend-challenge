import * as React from 'react'
import { cn } from '@/shared/lib/cn'

function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}
export { NativeSelect }
