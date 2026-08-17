'use client'

import { useRef, useState } from 'react'

import { cn } from '@/lib/cn'

type ProfileAssetUploadProps = {
  kind: 'cvId' | 'cvEn' | 'photo'
  label: string
  /** URL yang tersimpan saat halaman dimuat. */
  currentUrl: string | null | undefined
  /** Profil belum pernah disimpan, jadi belum ada baris tujuan. */
  disabled?: boolean
}

const ACCEPT = {
  cvId: 'application/pdf',
  cvEn: 'application/pdf',
  photo: 'image/png,image/jpeg,image/webp',
} as const

const HINT = {
  cvId: 'PDF, maksimal 8 MB.',
  cvEn: 'PDF, maksimal 8 MB.',
  photo: 'JPG, PNG, atau WebP. Maksimal 8 MB.',
} as const

/**
 * Unggah berkas profil (dua CV dan foto) langsung ke penyimpanan objek.
 *
 * Sebelumnya ketiganya berupa kolom teks berisi path manual ke folder
 * `public/`. Cara itu menuntut pemiliknya menaruh berkas lewat deploy dan
 * mengetik path-nya dengan benar; satu salah ketik menghasilkan tautan
 * unduh yang rusak tanpa peringatan apa pun.
 *
 * Unggahannya TIDAK lewat server action melainkan Route Handler, karena
 * server action membungkus seluruh formulir — mengunggah berkas akan ikut
 * menyimpan isian lain yang mungkin belum selesai diketik.
 */
export function ProfileAssetUpload({
  kind,
  label,
  currentUrl,
  disabled = false,
}: ProfileAssetUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(currentUrl ?? null)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [busy, setBusy] = useState(false)

  function report(text: string, failed: boolean) {
    setMessage(text)
    setIsError(failed)
  }

  async function upload(file: File) {
    setBusy(true)
    setMessage(null)

    try {
      const body = new FormData()
      body.append('kind', kind)
      body.append('file', file)

      const response = await fetch('/api/admin/profile/asset', {
        method: 'POST',
        body,
      })
      const result = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !result.url) {
        report(result.error ?? 'Berkas gagal diunggah.', true)
        return
      }

      setUrl(result.url)
      report('Berkas tersimpan.', false)
    } catch {
      report('Berkas gagal diunggah. Coba lagi.', true)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function remove() {
    setBusy(true)
    setMessage(null)

    try {
      const response = await fetch(
        `/api/admin/profile/asset?kind=${encodeURIComponent(kind)}`,
        { method: 'DELETE' },
      )
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        report(result.error ?? 'Berkas gagal dihapus.', true)
        return
      }

      setUrl(null)
      report('Berkas dihapus.', false)
    } catch {
      report('Berkas gagal dihapus. Coba lagi.', true)
    } finally {
      setBusy(false)
    }
  }

  const inputId = `asset-${kind}`

  return (
    <div>
      <p className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-xs text-muted">{HINT[kind]}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex min-h-11 cursor-pointer items-center rounded-full border border-border-med px-4 text-sm transition-colors',
            'hover:border-border-hover',
            (busy || disabled) && 'pointer-events-none opacity-50',
          )}
        >
          {url ? 'Ganti berkas' : 'Pilih berkas'}
        </label>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT[kind]}
          disabled={busy || disabled}
          onChange={(event) => {
            const file = event.target.files?.[0]

            if (file) void upload(file)
          }}
          className="sr-only"
        />

        {url ? (
          <>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm font-mono text-[11px] uppercase tracking-[0.06em] text-muted underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Lihat berkas
            </a>
            <button
              type="button"
              onClick={() => void remove()}
              disabled={busy}
              className="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
            >
              Hapus
            </button>
          </>
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-faint">
            Belum ada berkas
          </span>
        )}
      </div>

      {disabled ? (
        <p className="mt-2 text-xs text-muted">
          Simpan profil terlebih dahulu sebelum mengunggah berkas.
        </p>
      ) : null}

      {message ? (
        <p
          role="status"
          className={cn('mt-2 text-sm', isError ? 'text-danger' : 'text-muted')}
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
