import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { formatFullDate, toIsoString, type DateLike } from '@/lib/format'

type Revision = {
  id: string
  version: string
  changeSummary: string
  // DateLike, bukan Date: nilainya lewat unstable_cache (lihat format.ts).
  createdAt: DateLike
}

/**
 * Garis waktu revisi dokumen.
 *
 * Hanya menampilkan versi, tanggal, dan ringkasan perubahan — TIDAK isi
 * versi lama. Isi lama bisa memuat data yang justru sudah diredaksi di
 * versi terbaru; menerbitkannya kembali lewat riwayat akan membatalkan
 * redaksinya (02_REDACTION_CHECKLIST).
 */
export async function RevisionTimeline({
  revisions,
  locale,
}: {
  revisions: Revision[]
  locale: Locale
}) {
  const t = await getTranslations('knowledge.detail')

  if (revisions.length === 0) return null

  return (
    <section aria-labelledby="revisions-heading" className="mt-16">
      <h2
        id="revisions-heading"
        className="font-display text-xl font-semibold tracking-tight"
      >
        {t('revisions')}
      </h2>
      <p className="mt-2 text-sm text-muted">{t('revisionsNote')}</p>

      <ol className="mt-6 space-y-0 border-l border-border">
        {revisions.map((revision) => (
          <li key={revision.id} className="relative pb-6 pl-6 last:pb-0">
            <span
              aria-hidden
              className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary"
            />

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-medium">
                {t('version', { version: revision.version })}
              </span>
              <time
                dateTime={toIsoString(revision.createdAt)}
                className="text-sm text-muted"
              >
                {formatFullDate(revision.createdAt, locale)}
              </time>
            </div>

            <p className="mt-1 text-sm leading-relaxed text-muted">
              {revision.changeSummary}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
