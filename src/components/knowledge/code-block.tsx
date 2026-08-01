'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/cn'

/**
 * Blok perintah dengan tombol salin.
 *
 * Tidak ada penyorotan sintaks: library-nya berat, dan blok di situs ini
 * hampir seluruhnya perintah CLI dan konfigurasi perangkat jaringan yang
 * tidak dikenali grammar bahasa pemrograman mana pun. Nama bahasa tetap
 * ditampilkan sebagai label supaya konteksnya jelas.
 */
export function CodeBlock({
  code,
  language,
}: {
  code: string
  language?: string | null
}) {
  const t = useTranslations('knowledge')
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setFailed(false)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API butuh konteks aman (HTTPS/localhost) dan bisa
      // ditolak izinnya. Beri tahu, jangan diam-diam gagal.
      setFailed(true)
      window.setTimeout(() => setFailed(false), 3000)
    }
  }

  return (
    <div className="sk-inset group my-6 overflow-hidden rounded-2xl border border-border bg-elevated">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <span className="font-mono text-xs uppercase tracking-wide text-muted">
          {language || t('code')}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            'hover:bg-surface',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
            copied ? 'text-success' : failed ? 'text-danger' : 'text-muted',
          )}
        >
          {copied ? t('copied') : failed ? t('copyFailed') : t('copy')}
        </button>
      </div>

      {/* Bergulir sendiri: perintah panjang tidak boleh menggeser halaman.
          tabIndex membuat area gulir bisa dijangkau keyboard. */}
      <pre
        tabIndex={0}
        className="overflow-x-auto px-4 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
      >
        <code className="font-mono text-sm leading-relaxed">{code}</code>
      </pre>

      {/* Umpan balik untuk pembaca layar — perubahan warna tombol saja
          tidak terdengar. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? t('copied') : failed ? t('copyFailed') : ''}
      </span>
    </div>
  )
}
