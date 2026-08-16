'use client'

import { useState, useTransition } from 'react'

import { cn } from '@/lib/cn'

type DeleteButtonProps = {
  id: string
  action: (id: string) => Promise<{ error?: string }>
  label?: string
}

/**
 * Hapus dua langkah: klik pertama meminta konfirmasi, klik kedua
 * menjalankan.
 *
 * `window.confirm()` sengaja dihindari — dialog bawaan browser tidak
 * bisa ditata, tidak konsisten antar-platform, dan diblokir sebagian
 * konfigurasi. Konfirmasi inline tetap bisa dibatalkan dengan Escape.
 */
export function DeleteButton({
  id,
  action,
  label = 'Hapus',
}: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirming) {
      setConfirming(true)
      return
    }

    startTransition(async () => {
      const result = await action(id)

      if (result.error) {
        setError(result.error)
        setConfirming(false)
      }
    })
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setConfirming(false)
        }}
        onBlur={() => setConfirming(false)}
        disabled={pending}
        className={cn(
          'rounded-sm px-3 py-1 text-sm transition-colors disabled:opacity-50',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          confirming
            ? 'bg-danger text-white'
            : 'text-danger hover:bg-danger/10',
        )}
      >
        {pending ? 'Menghapus…' : confirming ? 'Yakin? Klik lagi' : label}
      </button>

      {error ? (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      ) : null}
    </span>
  )
}
