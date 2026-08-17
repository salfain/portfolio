'use client'

import { useState } from 'react'

import { cn } from '@/lib/cn'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

export type CertificateMetaRow = {
  label: string
  value: string
}

type CertificateLightboxProps = {
  name: string
  issuer: string
  imageUrl: string
  /** Baris meta yang sudah diformat di server (Terbit, Berlaku hingga). */
  meta: CertificateMetaRow[]
  skills: string[]
  credentialUrl: string | null
  labels: {
    /** Label tombol pembuka, mis. "Lihat sertifikat ...". */
    open: string
    close: string
    verify: string
  }
}

/**
 * Pratinjau sertifikat ukuran penuh.
 *
 * Gambar sertifikat pada kartu selalu terpotong dan teksnya tidak
 * terbaca — satu-satunya cara memeriksanya adalah membukanya besar.
 *
 * Dibangun di atas Radix Dialog, bukan overlay buatan sendiri: penutupan
 * lewat Escape, jebakan fokus, pengembalian fokus ke pemicu, dan
 * `aria-modal` sudah ditangani di sana. Overlay manual pada prototipe
 * desain tidak punya satu pun dari itu.
 */
export function CertificateLightbox({
  name,
  issuer,
  imageUrl,
  meta,
  skills,
  credentialUrl,
  labels,
}: CertificateLightboxProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'mb-6 block w-full overflow-hidden rounded-xl border border-border bg-background',
            'transition-colors hover:border-[var(--accent-line)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${name} - ${issuer}`}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-contain"
          />
          <span className="sr-only">{labels.open}</span>
        </button>
      </DialogTrigger>

      <DialogContent
        closeLabel={labels.close}
        // Panel ini tidak punya paragraf deskripsi; tanpa baris ini Radix
        // memperingatkan soal aria-describedby yang menunjuk ke nihil.
        aria-describedby={undefined}
        className="max-h-[88vh] max-w-[1040px] overflow-y-auto p-0"
      >
        <div className="grid gap-0 md:grid-cols-[minmax(0,1.35fr)_300px]">
          <div className="grid place-items-center bg-background p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`${name} - ${issuer}`}
              className="max-h-[70vh] w-full object-contain"
            />
          </div>

          <div className="flex flex-col gap-5 border-border p-7 md:border-l">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
              {issuer}
            </p>

            {/* `pr-10` menyisakan ruang untuk tombol tutup bulat yang
                diposisikan absolut di pojok kanan atas panel. */}
            <DialogTitle className="pr-10 font-display text-[24px] leading-tight">
              {name}
            </DialogTitle>

            {meta.length > 0 ? (
              <dl className="flex flex-col">
                {meta.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-4 border-b border-border py-3"
                  >
                    <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
                      {row.label}
                    </dt>
                    <dd className="text-[15px] text-text-2">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {skills.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full border border-border-med px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            ) : null}

            {credentialUrl ? (
              <a
                href={credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'mt-auto inline-flex items-center justify-center gap-2 rounded-full',
                  'bg-primary px-6 py-3 text-[15px] font-medium text-primary-foreground',
                  'transition-colors hover:bg-primary-hi',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                )}
              >
                {labels.verify}
                <span aria-hidden>&rarr;</span>
              </a>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
