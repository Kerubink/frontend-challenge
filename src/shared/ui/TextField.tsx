import { useId, type ComponentProps } from 'react'
import { Input } from '@/shared/ui/shadcn/input'
import { Label } from '@/shared/ui/shadcn/label'

interface Props extends ComponentProps<typeof Input> {
  label: string
  error?: string
  hint?: string
}

/** Campo com label, hint e erro associados (aria-describedby / aria-invalid). */
export function TextField({ label, error, hint, id, required, ...props }: Props) {
  const auto = useId()
  const fieldId = id ?? auto
  const describedBy = [error ? `${fieldId}-error` : null, hint ? `${fieldId}-hint` : null].filter(Boolean).join(' ') || undefined
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-text-coral">
            *
          </span>
        )}
      </Label>
      <Input id={fieldId} required={required} aria-invalid={!!error} aria-describedby={describedBy} {...props} />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="text-xs text-text-coral">
          {error}
        </p>
      )}
    </div>
  )
}
