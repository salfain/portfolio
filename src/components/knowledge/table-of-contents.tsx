'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/cn'
import type { Heading } from '@/lib/prosemirror/headings'

/**
 * Daftar isi lengket dengan penanda bagian aktif.
 *
 * Bagian aktif ditentukan `IntersectionObserver`, bukan perhitungan
 * `scrollY` di event scroll: observer tidak berjalan di thread utama pada
 * setiap frame, jadi tidak ikut membebani halaman panjang.
 *
 * `rootMargin` atasnya negatif supaya judul dianggap aktif ketika sudah
 * mendekati atas viewport, bukan ketika baru menyentuh tepi bawah.
 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const t = useTranslations('knowledge.detail')
  const [activeId, setActiveId] = useState<string | null>(
    headings[0]?.id ?? null,
  )

  useEffect(() => {
    if (headings.length === 0) return

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-labelledby="toc-heading" className="lg:sticky lg:top-24">
      <h2
        id="toc-heading"
        className="font-display text-sm font-semibold uppercase tracking-wide text-muted"
      >
        {t('onThisPage')}
      </h2>

      <ul className="mt-4 space-y-1 border-l border-border">
        {headings.map((heading) => {
          const isActive = heading.id === activeId

          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={cn(
                  'block border-l-2 py-1.5 pr-2 text-sm transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  heading.level >= 3 ? 'pl-7' : 'pl-4',
                  isActive
                    ? 'border-primary font-medium text-primary'
                    : 'border-transparent text-muted hover:text-foreground',
                )}
              >
                {heading.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
