import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import type { Locale } from '@/i18n/routing'
import { resolveLocalized } from '@/lib/i18n-content'
import { formatFullDate, toIsoString } from '@/lib/format'
import { documentHref, TYPE_KEYS } from '@/lib/knowledge-type'
import type { DocumentCard as DocumentCardData } from '@/data/knowledge'

/**
 * Kartu satu dokumen di listing.
 *
 * Seluruh kartu adalah satu tautan — tidak ada tautan bersarang di
 * dalamnya. Tag ditampilkan sebagai label, bukan tautan: tautan di dalam
 * tautan tidak valid dan membingungkan pembaca layar. Menelusuri per tag
 * lewat panel filter di sisi halaman.
 */
export async function DocumentCard({
  document,
  locale,
}: {
  document: DocumentCardData
  locale: Locale
}) {
  const t = await getTranslations('knowledge')
  const title = resolveLocalized(document, 'title', locale)
  const summary = resolveLocalized(document, 'summary', locale)

  const meta = [
    document.documentCode,
    document.difficulty ? t(`difficulty.${document.difficulty}`) : null,
    document.estimatedMinutes
      ? t('card.minutes', { minutes: document.estimatedMinutes })
      : null,
  ].filter(Boolean)

  return (
    <Link
      href={documentHref(document.type, document.slug)}
      className={cn(
        'group flex flex-col rounded-3xl border border-border bg-surface p-6',
        'transition-colors hover:border-primary/40',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-sm bg-primary/10 px-3 py-0.5 font-medium text-primary">
          {t(`types.${TYPE_KEYS[document.type]}.name`)}
        </span>
        {meta.map((item) => (
          <span key={String(item)} className="text-muted">
            {item}
          </span>
        ))}
      </div>

      <h3
        lang={title.lang}
        className="mt-4 font-display text-lg font-semibold tracking-tight group-hover:text-primary"
      >
        {title.value}
      </h3>

      <p
        lang={summary.lang}
        className="text-justified mt-2 line-clamp-3 text-sm leading-relaxed text-muted"
      >
        {summary.value}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 text-xs text-muted">
        {document.tags.slice(0, 3).map(({ tag }) => (
          <span
            key={tag.slug}
            className="rounded-sm bg-elevated px-2.5 py-0.5"
          >
            {tag.name}
          </span>
        ))}
        {document.publishedAt ? (
          <time
            dateTime={toIsoString(document.publishedAt)}
            className="ml-auto"
          >
            {formatFullDate(document.publishedAt, locale)}
          </time>
        ) : null}
      </div>
    </Link>
  )
}
