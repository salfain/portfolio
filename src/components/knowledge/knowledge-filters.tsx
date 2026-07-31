'use client'

import { useTranslations } from 'next-intl'
import { useTransition } from 'react'

import { Link, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { buildFilterQuery } from '@/lib/schemas/knowledge-filters'
import type { KnowledgeFilters } from '@/lib/schemas/knowledge-filters'

type Option = { value: string; label: string }

type KnowledgeFiltersProps = {
  /** Path listing saat ini, mis. `/knowledge/sop`. */
  basePath: string
  filters: KnowledgeFilters
  categories: Option[]
  tags: Option[]
  resultCount: number
}

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const

/**
 * Panel filter listing.
 *
 * Dibungkus `<form>` sungguhan tanpa `action`, jadi menekan Enter tetap
 * menyaring meski JavaScript gagal dimuat — peramban mengirim GET ke URL
 * yang sama beserta query-nya. Dengan JS aktif, `router.push` mengambil
 * alih supaya tidak terjadi muat ulang penuh.
 */
export function KnowledgeFilters({
  basePath,
  filters,
  categories,
  tags,
  resultCount,
}: KnowledgeFiltersProps) {
  const t = useTranslations('knowledge')
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function navigate(next: Partial<KnowledgeFilters>) {
    const merged = { ...filters, ...next }

    startTransition(() => {
      router.push(`${basePath}${buildFilterQuery(merged)}`)
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    navigate({ q: (data.get('q') as string) || undefined })
  }

  const isFiltered =
    filters.q !== undefined ||
    filters.kategori !== undefined ||
    filters.tag !== undefined ||
    filters.tingkat !== undefined

  const selectClass = cn(
    'w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  )

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={pending}
      className="space-y-5 rounded-3xl border border-border bg-surface p-6"
    >
      <h2 className="font-display text-base font-semibold">
        {t('filters.heading')}
      </h2>

      <div>
        <label htmlFor="q" className="block text-sm font-medium">
          {t('filters.search')}
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={filters.q ?? ''}
          placeholder={t('filters.searchPlaceholder')}
          // `key` memaksa input dibuat ulang saat filter direset dari luar
          // (mis. tombol "hapus filter"), kalau tidak nilai lamanya bertahan.
          key={filters.q ?? ''}
          className={cn(selectClass, 'mt-2')}
        />
      </div>

      {categories.length > 0 ? (
        <div>
          <label htmlFor="kategori" className="block text-sm font-medium">
            {t('filters.category')}
          </label>
          <select
            id="kategori"
            name="kategori"
            value={filters.kategori ?? ''}
            onChange={(event) =>
              navigate({ kategori: event.target.value || undefined })
            }
            className={cn(selectClass, 'mt-2')}
          >
            <option value="">{t('filters.all')}</option>
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div>
          <label htmlFor="tag" className="block text-sm font-medium">
            {t('filters.tag')}
          </label>
          <select
            id="tag"
            name="tag"
            value={filters.tag ?? ''}
            onChange={(event) =>
              navigate({ tag: event.target.value || undefined })
            }
            className={cn(selectClass, 'mt-2')}
          >
            <option value="">{t('filters.all')}</option>
            {tags.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label htmlFor="tingkat" className="block text-sm font-medium">
          {t('difficulty.label')}
        </label>
        <select
          id="tingkat"
          name="tingkat"
          value={filters.tingkat ?? ''}
          onChange={(event) =>
            navigate({
              tingkat:
                (event.target.value as KnowledgeFilters['tingkat']) || undefined,
            })
          }
          className={cn(selectClass, 'mt-2')}
        >
          <option value="">{t('filters.all')}</option>
          {DIFFICULTIES.map((level) => (
            <option key={level} value={level}>
              {t(`difficulty.${level}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            'rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground',
            'transition-opacity hover:opacity-90 disabled:opacity-50',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          )}
        >
          {t('filters.submit')}
        </button>

        {isFiltered ? (
          <Link
            href={basePath}
            className="rounded-sm text-sm text-muted underline underline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t('filters.reset')}
          </Link>
        ) : null}
      </div>

      {/* Jumlah hasil diumumkan ke pembaca layar — daftar yang berubah di
          bawah panel filter tidak terdengar dengan sendirinya. */}
      <p role="status" aria-live="polite" className="text-sm text-muted">
        {t('filters.resultCount', { count: resultCount })}
      </p>
    </form>
  )
}
