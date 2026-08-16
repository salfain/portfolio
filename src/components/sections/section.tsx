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
      className={cn('scroll-mt-24 py-10 md:py-14', className)}
    >
      <Container>
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-prose">
              <h2
                id={headingId}
                className="font-display text-2xl font-semibold tracking-tight md:text-3xl"
              >
                {title}
              </h2>
              {description ? (
                <p className="mt-3 text-justify text-base leading-relaxed text-muted">
                  {description}
                </p>
              ) : null}
            </div>
            {action ? (
              <div className="shrink-0 self-start sm:self-auto">{action}</div>
            ) : null}
          </div>
        </Reveal>

        <div className="mt-6 md:mt-8">{children}</div>
      </Container>
    </section>
  )
}
