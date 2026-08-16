'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
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
  /**
   * Dimensi asli, dibaca dari header berkas saat diunggah.
   *
   * `null` untuk aset lama yang dimasukkan sebelum manajer bukti ada. Aset
   * seperti itu tetap dirender, hanya saja lewat `<img>` biasa — lihat
   * `EvidenceImage` di bawah.
   */
  width: number | null
  height: number | null
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
/**
 * Gambar bukti.
 *
 * `next/image` dipakai begitu dimensinya diketahui — itulah yang membuatnya
 * bisa memesan ruang sehingga halaman tidak melompat saat gambar selesai
 * dimuat. Dimensi kini dibaca dari header berkas saat diunggah
 * (`src/lib/media-file.ts`), yang menutup N3 Fase 4.
 *
 * Aset tanpa dimensi tetap dirender dengan `<img>`. `next/image` menuntut
 * `width`/`height` atau `fill`; menebak angkanya berarti gambar yang
 * proporsinya salah, dan itu lebih buruk daripada kehilangan optimasi.
 *
 * Sumbernya selalu se-origin (`/media/...`), jadi `images.remotePatterns`
 * tetap kosong dan tidak ada host luar yang perlu dipercaya.
 */
function EvidenceImage({
  item,
  className,
  sizes,
  priority = false,
}: {
  item: EvidenceItem
  className: string
  sizes: string
  priority?: boolean
}) {
  if (item.width === null || item.height === null) {
    // Dimensi aset ini tidak tersimpan; lihat komentar di atas.
    return (
      // eslint-disable-next-line @next/next/no-img-element -- tanpa dimensi
      <img src={item.src} alt={item.alt} loading="lazy" className={className} />
    )
  }

  return (
    <Image
      src={item.src}
      alt={item.alt}
      width={item.width}
      height={item.height}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  )
}

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
                'group w-full overflow-hidden rounded-3xl border border-border bg-surface text-left',
                'transition-colors hover:border-[var(--accent-line)]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              )}
            >
              <EvidenceImage
                item={item}
                className="aspect-video w-full object-cover"
                sizes="(min-width: 640px) 50vw, 100vw"
              />

              <span className="block p-5">
                <span className="block text-[15px] font-medium leading-snug">
                  {item.title ?? t('openImage')}
                </span>
                {item.caption ? (
                  <span className="mt-2 block text-[15px] leading-relaxed text-muted">
                    {item.caption}
                  </span>
                ) : null}
                {/* Alat dan tanggal uji: baris mono, sama seperti meta di
                    kartu dokumen dan proyek. */}
                {item.tool || item.testDate ? (
                  <span className="mt-3 block font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
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

            <EvidenceImage
              item={active}
              className="mt-4 max-h-[70vh] w-full rounded-2xl object-contain"
              sizes="(min-width: 1024px) 960px, 100vw"
              priority
            />

            {active.caption ? (
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                {active.caption}
              </p>
            ) : null}

            {items.length > 1 ? (
              <div className="mt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => show(activeIndex - 1)}
                  className="rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted hover:bg-elevated hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  ← {t('previousImage')}
                </button>

                <span
                  aria-live="polite"
                  className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint"
                >
                  {t('imagePosition', {
                    current: activeIndex + 1,
                    total: items.length,
                  })}
                </span>

                <button
                  type="button"
                  onClick={() => show(activeIndex + 1)}
                  className="rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted hover:bg-elevated hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
