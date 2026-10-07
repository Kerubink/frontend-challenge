import * as React from 'react'
import { cn } from '@/shared/lib/cn'

const Card = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div className={cn('flex flex-col gap-4 rounded-xl border bg-card py-5 text-card-foreground shadow-sm', className)} {...props} />
)
const CardHeader = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div className={cn('flex flex-col gap-1.5 px-5', className)} {...props} />
)
const CardTitle = ({ className, ...props }: React.ComponentProps<'h2'>) => (
  <h2 className={cn('leading-none font-semibold', className)} {...props} />
)
const CardDescription = ({ className, ...props }: React.ComponentProps<'p'>) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
)
const CardContent = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div className={cn('px-5', className)} {...props} />
)
const CardFooter = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div className={cn('flex items-center px-5', className)} {...props} />
)
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
