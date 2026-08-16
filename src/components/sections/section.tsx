import { type ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion'

type SectionProps = {
  /** Dipakai sebagai target anchor dari panel "Jelajahi Pekerjaan Saya". */
  id?: string
  title: string
  description?: string
  /** Tautan "lihat semua" di kanan judul. */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Kerangka satu bagian halaman: judul, deskripsi opsional, isi.
 *
 * Judul dihubungkan ke `<section>` lewat `aria-labelledby` supaya
 * pembaca layar bisa melompat antar-bagian.
 *
 * Jarak antar-bagian dibawa oleh `border-t` + padding, bukan margin per
 * elemen: bagian mana pun bisa dipindahkan tanpa menyisakan celah ganda.
 * Bagian pertama pada satu halaman menghapus garisnya lewat
 * `first:border-t-0`.
 */
export function Section({
  id,
  title,
  description,
  action,
  children,
  className,
}: SectionProps) {
  const headingId = id ? `${id}-heading` : undefined

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        'scroll-mt-28 border-t border-border py-14 first:border-t-0 md:py-16',
        className,
      )}
    >
      <Container>
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {/* `flex-1` — bukan max-w-prose — supaya deskripsi bagian ikut
                memakai lebar penuh dan tidak menyisakan rongga di kanan. */}
            <div className="min-w-0 flex-1">
              <h2 id={headingId} className="font-display text-h2">
                {title}
              </h2>
              {description ? (
                <p className="mt-4 max-w-[62ch] leading-relaxed text-muted">
                  {description}
                </p>
              ) : null}
            </div>
            {action ? (
              <div className="shrink-0 self-start sm:self-auto">{action}</div>
            ) : null}
          </div>
        </Reveal>

        <div className="mt-9 md:mt-10">{children}</div>
      </Container>
    </section>
  )
}
