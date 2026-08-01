'use client'

import { useState, useTransition } from 'react'

import { cn } from '@/lib/cn'

import { toggleMessageReadAction } from './actions'

export function ToggleReadButton({
  id,
  isRead,
}: {
  id: string
  isRead: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await toggleMessageReadAction(id, !isRead)
            if (result.error) setError(result.error)
          })
        }
        className={cn(
          'rounded-sm px-3 py-1 text-sm text-muted transition-colors',
          'hover:bg-elevated hover:text-foreground disabled:opacity-50',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        )}
      >
        {pending
          ? 'Menyimpan…'
          : isRead
            ? 'Tandai belum dibaca'
            : 'Tandai sudah dibaca'}
      </button>

      {error ? (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      ) : null}
    </span>
  )
}
