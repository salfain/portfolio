import { type ReactNode } from 'react'

import { cn } from '@/lib/cn'

type EmptyStateProps = {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'sk-inset flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-elevated text-muted">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
