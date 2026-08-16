import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { pickLocale } from '@/lib/i18n-content'
import type { IncidentMetadata } from '@/lib/schemas/knowledge-metadata'

import { EvidenceFacts, EvidenceTable } from './evidence-table'

/**
 * Blok bukti untuk dokumen tipe Insiden.
 *
 * Penanda skenario lab dirender PALING ATAS dan tidak bisa dimatikan.
 * `02_REDACTION_CHECKLIST.md` bagian H dan `07_SCHEMA_DECISIONS.md`
 * penyimpangan #8 sama-sama menuntutnya: insiden lab yang tampil seperti
 * insiden produksi adalah mengarang pengalaman, dan pewawancara teknis
 * akan menemukannya lebih cepat daripada yang diperkirakan penulisnya.
 */
export async function IncidentBlocks({
  meta,
  locale,
}: {
  meta: IncidentMetadata
  locale: Locale
}) {
  const t = await getTranslations('knowledge.incident')

  const analysis = [
    { label: t('rootCause'), value: localized(meta, 'rootCause', locale) },
    { label: t('workaround'), value: localized(meta, 'workaround', locale) },
    { label: t('resolution'), value: localized(meta, 'resolution', locale) },
    { label: t('validation'), value: localized(meta, 'validation', locale) },
    { label: t('prevention'), value: localized(meta, 'prevention', locale) },
  ].filter((block) => block.value !== '')

  return (
    <section className="mt-16" aria-labelledby="rincian-insiden">
      {meta.isLabReproduction ? (
        <p className="mb-6 flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-2xl border border-warning bg-elevated px-5 py-4">
          <strong className="font-medium">{t('labNotice')}</strong>
          <span className="text-sm text-muted">{t('labNoticeBody')}</span>
        </p>
      ) : null}

      <h2 id="rincian-insiden" className="font-display text-2xl">
        {t('heading')}
      </h2>

      <EvidenceFacts
        facts={[
          { label: t('number'), value: meta.number },
          { label: t('priority'), value: meta.priority },
          {
            label: t('impact'),
            value: meta.impact ? t(`level.${meta.impact}`) : null,
          },
          {
            label: t('urgency'),
            value: meta.urgency ? t(`level.${meta.urgency}`) : null,
          },
          { label: t('affectedService'), value: meta.affectedService },
          {
            label: t('resolutionTime'),
            value:
              meta.resolutionMinutes === null
                ? null
                : t('minutes', { minutes: meta.resolutionMinutes }),
          },
        ]}
      />

      <EvidenceTable
        caption={t('timeline')}
        headers={[t('timelineAt'), t('timelineEvent')]}
        rows={meta.timeline.map((entry) => [
          <code
            key="a"
            className="whitespace-nowrap font-mono text-xs text-foreground"
          >
            {entry.at}
          </code>,
          entry.event,
        ])}
      />

      {analysis.length > 0 ? (
        <dl className="mt-8 space-y-6">
          {analysis.map((block) => (
            <div key={block.label}>
              <dt className="text-lg font-medium">{block.label}</dt>
              <dd className="mt-2 whitespace-pre-line text-muted">
                {block.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {meta.relatedSopSlug ? (
        <p className="mt-8">
          <span className="text-sm text-muted">{t('relatedSop')}: </span>
          <Link
            href={`/knowledge/sop/${meta.relatedSopSlug}`}
            className="rounded-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {meta.relatedSopSlug}
          </Link>
        </p>
      ) : null}
    </section>
  )
}

/**
 * Ambil versi bahasa yang sesuai, dengan fallback ke Indonesia.
 *
 * Aturannya sama dengan isi dokumen (08_I18N_FALLBACK_POLICY §3): teks
 * Inggris yang kosong jatuh ke Indonesia, bukan menghilang.
 */
function localized(
  meta: IncidentMetadata,
  field:
    'rootCause' | 'workaround' | 'resolution' | 'validation' | 'prevention',
  locale: Locale,
): string {
  return pickLocale(meta, field, locale)
}
