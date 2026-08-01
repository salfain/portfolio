'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/cn'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui'

export type EvidenceItem = {
  id: string
  src: string
  alt: string
  caption: string | null
  title: string | null
  tool: string | null
  testDate: string | null
}

/**
 * Galeri bukti dengan lightbox.
 *
 * Lightbox memakai Radix Dialog, bukan overlay buatan sendiri: Radix sudah
 * menangani jebakan fokus, tutup dengan Escape, `aria-modal`, dan
 * mengembalikan fokus ke pemicu saat ditutup. Menulis ulang semua itu
 * hampir selalu menghasilkan versi yang bocor fokusnya.
 *
 * Navigasi panah kiri/kanan ditambahkan di atasnya — Radix tidak tahu
 * bahwa isi dialognya adalah rangkaian gambar.
 */
export function EvidenceGallery({ items }: { items: EvidenceItem[] }) {
  const t = useTranslations('knowledge.detail')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const show = useCallback(
    (next: number) => {
      // Berputar: dari gambar terakhir maju kembali ke yang pertama.
      setOpenIndex(((next % items.length) + items.length) % items.length)
    },
    [items.length],
  )

  useEffect(() => {
    if (openIndex === null) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') show(openIndex + 1)
      if (event.key === 'ArrowLeft') show(openIndex - 1)
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openIndex, show])

  if (items.length === 0) return null

  // Disalin ke variabel lokal supaya tidak perlu non-null assertion
  // di dalam handler tombol (dilarang eslint, dan memang menyembunyikan
  // kemungkinan null yang nyata).
  const activeIndex = openIndex ?? 0
  const active = openIndex === null ? null : items[activeIndex]

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className={cn(
                'group w-full overflow-hidden rounded-2xl border border-border bg-surface text-left',
                'transition-colors hover:border-primary/40',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- dimensi
                  aset belum tentu tersimpan, dan images.remotePatterns baru
                  diisi di Fase 5 saat penyimpanan objek dipasang. */}
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="aspect-video w-full object-cover"
              />

              <span className="block p-4">
                <span className="block text-sm font-medium">
                  {item.title ?? t('openImage')}
                </span>
                {item.caption ? (
                  <span className="mt-1 block text-sm text-muted">
                    {item.caption}
                  </span>
                ) : null}
                {item.tool || item.testDate ? (
                  <span className="mt-2 block text-xs text-muted">
                    {[item.tool, item.testDate].filter(Boolean).join(' · ')}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null)
        }}
      >
        {active ? (
          <DialogContent
            closeLabel={t('closeImage')}
            className="max-w-4xl p-4 sm:p-6"
          >
            <DialogTitle className="pr-12 text-base">
              {active.title ?? active.alt}
            </DialogTitle>

            {/* eslint-disable-next-line @next/next/no-img-element -- sama
                dengan di atas: menunggu penyimpanan objek di Fase 5. */}
            <img
              src={active.src}
              alt={active.alt}
              className="mt-4 max-h-[70vh] w-full rounded-2xl object-contain"
            />

            {active.caption ? (
              <p className="mt-3 text-sm text-muted">{active.caption}</p>
            ) : null}

            {items.length > 1 ? (
              <div className="mt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => show(activeIndex - 1)}
                  className="rounded-md px-4 py-2 text-sm text-muted hover:bg-elevated hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  ← {t('previousImage')}
                </button>

                <span aria-live="polite" className="text-xs text-muted">
                  {t('imagePosition', {
                    current: activeIndex + 1,
                    total: items.length,
                  })}
                </span>

                <button
                  type="button"
                  onClick={() => show(activeIndex + 1)}
                  className="rounded-md px-4 py-2 text-sm text-muted hover:bg-elevated hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {t('nextImage')} →
                </button>
              </div>
            ) : null}
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  )
}
