import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/** Feedback acessível: erros usam role="alert"; sucessos/infos usam role="status". */
export function Alert({ tone = 'info', children, className }: { tone?: 'info' | 'error' | 'success'; children: ReactNode; className?: string }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-md border px-3 py-2 text-sm',
        tone === 'error' && 'border-text-coral text-text-coral',
        tone === 'success' && 'border-primary text-accent-foreground',
        tone === 'info' && 'border-border text-text-secondary',
        className,
      )}
    >
      {children}
    </div>
  )
}
