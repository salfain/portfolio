'use client'

import { useState, useTransition } from 'react'

import { cn } from '@/lib/cn'
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

type DeleteButtonProps = {
  id: string
  action: (id: string) => Promise<{ error?: string }>
  label?: string
  /** Nama entri, ditampilkan di dalam dialog konfirmasi. */
  name?: string
}

/**
 * Hapus dengan dialog konfirmasi.
 *
 * Sebelumnya ini konfirmasi dua-klik inline. Diganti karena teks tombol
 * yang berubah jadi "Yakin? Klik lagi" tidak pernah menyebut APA yang
 * akan hilang — pada tabel berisi belasan baris yang mirip, itu tidak
 * cukup untuk menahan penghapusan yang salah sasaran. Penghapusan di
 * sini permanen dan tidak ada undo.
 *
 * `window.confirm()` tetap dihindari: tidak bisa ditata, tidak konsisten
 * antar-platform, dan diblokir sebagian konfigurasi. Radix Dialog sudah
 * membawa jebakan fokus, Escape, dan pengembalian fokus ke pemicu.
 */
export function DeleteButton({
  id,
  action,
  label = 'Hapus',
  name,
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await action(id)

      // Sukses tidak menutup dialog di sini: server action me-revalidate
      // dan barisnya ikut hilang bersama dialognya. Yang perlu ditangani
      // hanya jalur gagal.
      if (result.error) {
        setError(result.error)
        setOpen(false)
      }
    })
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className={cn(
              'rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em]',
              'text-danger transition-colors hover:bg-danger/10',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
            )}
          >
            {label}
          </button>
        </DialogTrigger>

        <DialogContent
          closeLabel="Tutup"
          className="max-w-[460px] rounded-3xl p-[30px]"
        >
          <DialogTitle className="pr-10 font-display text-[28px] leading-tight">
            Hapus entri ini?
          </DialogTitle>

          <DialogDescription className="mt-4">
            {name ? (
              <>
                <span className="text-foreground">{name}</span> akan dihapus
                dari basis data.
              </>
            ) : (
              'Entri ini akan dihapus dari basis data.'
            )}
          </DialogDescription>

          <p className="mt-2 text-sm text-muted">
            Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="mt-7 flex justify-end gap-3">
            <DialogClose asChild>
              <Button type="button" variant="secondary" size="sm">
                Batal
              </Button>
            </DialogClose>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={pending}
            >
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {error ? (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      ) : null}
    </span>
  )
}
