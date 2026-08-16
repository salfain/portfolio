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
        'group flex flex-col rounded-3xl border border-border bg-surface p-7',
        'transition-colors hover:border-[var(--accent-line)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em]">
        {/* Badge tipe: aksen di atas latar aksen lembut — satu-satunya
            elemen berwarna di kartu, jadi tipe dokumen terbaca lebih dulu
            daripada judulnya saat memindai grid. */}
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-primary">
          {t(`types.${TYPE_KEYS[document.type]}.name`)}
        </span>
        {meta.map((item) => (
          <span key={String(item)} className="text-faint">
            {item}
          </span>
        ))}
      </div>

      <h3
        lang={title.lang}
        className="mt-5 text-[19px] font-medium leading-snug transition-colors group-hover:text-primary"
      >
        {title.value}
      </h3>

      <p
        lang={summary.lang}
        className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-muted"
      >
        {summary.value}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
        {document.tags.slice(0, 3).map(({ tag }) => (
          <span key={tag.slug}>{tag.name}</span>
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
