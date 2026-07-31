import { type HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger'

const variantClasses: Record<Variant, string> = {
  default: 'bg-elevated text-foreground',
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  danger: 'bg-danger text-white',
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
