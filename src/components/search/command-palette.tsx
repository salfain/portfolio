'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/cn'
import { Link, useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui'

type Hit = {
  id: string
  kind: 'document' | 'project'
  slug: string
  segment: string | null
  titleId: string
  titleEn: string | null
  summaryId: string
  summaryEn: string | null
  documentCode: string | null
}

const DEBOUNCE_MS = 200
const MIN_LENGTH = 2

/**
 * Command palette seluruh situs.
 *
 * Dibuka dengan Ctrl/Cmd+K atau tombol di navbar — pintasan keyboard saja
 * tidak cukup, karena tidak ada yang menemukannya tanpa diberi tahu
 * (docs/rules/05_ACCESSIBILITY.md).
 *
 * Memakai Radix Dialog seperti lightbox bukti: jebakan fokus, Escape, dan
 * pengembalian fokus ke pemicu sudah benar tanpa ditulis ulang. Yang
 * ditambahkan di atasnya hanya navigasi panah — Radix tidak tahu isi
 * dialognya adalah daftar hasil.
 */
export function CommandPalette() {
  const t = useTranslations('search')
  const locale = useLocale()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const listId = 'command-palette-hasil'
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((previous) => !previous)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  /**
   * Permintaan lama dibatalkan saat kata kunci berubah.
   *
   * Tanpa ini, balasan yang datang terlambat untuk kata kunci sebelumnya
   * akan menimpa hasil yang lebih baru — hasil pencarian yang "melompat
   * mundur" tepat saat pengguna selesai mengetik.
   */
  useEffect(() => {
    const trimmed = query.trim()

    if (trimmed.length < MIN_LENGTH) {
      setHits([])
      setLoading(false)

      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        )
        const data: { hits: Hit[] } = await response.json()

        setHits(data.hits)
        setActiveIndex(0)
      } catch {
        // Termasuk pembatalan — tidak ada yang perlu ditampilkan.
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

  const hrefFor = useCallback(
    (hit: Hit) =>
      hit.kind === 'project'
        ? `/projects/${hit.slug}`
        : `/knowledge/${hit.segment}/${hit.slug}`,
    [],
  )

  const titleFor = useCallback(
    (hit: Hit) => (locale === 'en' && hit.titleEn ? hit.titleEn : hit.titleId),
    [locale],
  )

  const summaryFor = useCallback(
    (hit: Hit) =>
      locale === 'en' && hit.summaryEn ? hit.summaryEn : hit.summaryId,
    [locale],
  )

  const activeId = useMemo(
    () => (hits[activeIndex] ? `${listId}-${hits[activeIndex].id}` : undefined),
    [hits, activeIndex],
  )

  function onInputKeyDown(event: React.KeyboardEvent) {
    if (hits.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % hits.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + hits.length) % hits.length)
    }

    if (event.key === 'Enter') {
      const hit = hits[activeIndex]

      if (hit) {
        event.preventDefault()
        setOpen(false)
        router.push(hrefFor(hit))
      }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted',
          'transition-colors hover:border-primary/40 hover:text-foreground',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        )}
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        {t('trigger')}
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)

          if (!next) {
            setQuery('')
            setHits([])
          }
        }}
      >
        <DialogContent
          closeLabel={t('close')}
          className="top-24 max-w-xl translate-y-0 p-0"
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            inputRef.current?.focus()
          }}
        >
          <DialogTitle className="sr-only">{t('title')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('description')}
          </DialogDescription>

          <div className="border-b border-border p-4 pr-16">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder={t('placeholder')}
              aria-label={t('title')}
              role="combobox"
              aria-expanded={hits.length > 0}
              aria-controls={listId}
              aria-activedescendant={activeId}
              autoComplete="off"
              className="w-full bg-transparent text-base outline-none placeholder:text-muted"
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            <p aria-live="polite" className="sr-only">
              {loading
                ? t('searching')
                : t('resultCount', { count: hits.length })}
            </p>

            {query.trim().length < MIN_LENGTH ? (
              <p className="px-3 py-6 text-center text-sm text-muted">
                {t('idle')}
              </p>
            ) : hits.length === 0 && !loading ? (
              <p className="px-3 py-6 text-center text-sm text-muted">
                {t('empty')}
              </p>
            ) : (
              <ul id={listId} role="listbox" aria-label={t('title')}>
                {hits.map((hit, index) => (
                  <li key={hit.id} role="presentation">
                    <Link
                      id={`${listId}-${hit.id}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      href={hrefFor(hit)}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        'block rounded-2xl px-3 py-2.5 transition-colors',
                        index === activeIndex
                          ? 'bg-elevated'
                          : 'bg-transparent',
                      )}
                    >
                      <span className="flex items-baseline gap-2">
                        <span className="font-medium">{titleFor(hit)}</span>
                        <span className="shrink-0 text-xs text-muted">
                          {hit.kind === 'project'
                            ? t('groups.projects')
                            : (hit.documentCode ?? t('groups.documents'))}
                        </span>
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-sm text-muted">
                        {summaryFor(hit)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="border-t border-border px-4 py-2.5 text-xs text-muted">
            {t('hint')}
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
