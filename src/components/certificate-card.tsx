import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { formatFullDate, toIsoString } from '@/lib/format'
import type { PublicCertificate } from '@/data/certificate'

import { CertificateLightbox } from '@/components/certificate-lightbox'

type CertificateCardProps = {
  certificate: PublicCertificate
  locale: Locale
  /**
   * Kartu lebar dua kolom: teks di kiri, gambar dan chip di kanan.
   * Dipakai untuk kredensial pertama, sesuai `Sertifikasi.dc.html`.
   */
  wide?: boolean
}

/**
 * Satu kartu sertifikat.
 *
 * Handoff memuat satu paragraf deskripsi per sertifikat. `Certificate`
 * TIDAK punya kolom itu, jadi paragrafnya tidak dirender — daftar
 * keahlian yang memang tersimpan sudah menerangkan isinya, dan mengarang
 * kalimat deskripsi berarti mengarang klaim tentang isi kredensial.
 */
export async function CertificateCard({
  certificate,
  locale,
  wide = false,
}: CertificateCardProps) {
  const t = await getTranslations('certifications')

  const year = certificate.issueDate
    ? new Date(certificate.issueDate).getFullYear()
    : null

  const meta = [
    certificate.issueDate
      ? {
          label: t('issued'),
          value: formatFullDate(certificate.issueDate, locale),
        }
      : null,
    certificate.expiryDate
      ? {
          label: t('validUntil'),
          value: formatFullDate(certificate.expiryDate, locale),
        }
      : null,
  ].filter((row) => row !== null)

  const image = certificate.imageUrl ? (
    <CertificateLightbox
      name={certificate.name}
      issuer={certificate.issuer}
      imageUrl={certificate.imageUrl}
      skills={certificate.skills}
      credentialUrl={certificate.credentialUrl}
      meta={meta}
      labels={{
        open: t('openImage', { name: certificate.name }),
        close: t('closeImage'),
        verify: t('verify'),
      }}
    />
  ) : null

  const chips =
    certificate.skills.length > 0 ? (
      <ul className="flex flex-wrap gap-2">
        {certificate.skills.map((skill) => (
          <li
            key={skill}
            className="rounded-full border border-border-med px-2.5 py-1 font-mono text-[11px] text-muted"
          >
            {skill}
          </li>
        ))}
      </ul>
    ) : null

  const text = (
    <div className="min-w-0">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-faint">
        {certificate.issuer}
        {year ? ` · ${year}` : ''}
      </p>

      <h3
        className={cn(
          'mt-3.5 font-medium leading-snug',
          wide ? 'text-[22px] md:text-[26px]' : 'text-[19px]',
        )}
      >
        {certificate.name}
      </h3>

      {certificate.issueDate ? (
        <p className="mt-3 text-[15px] text-muted">
          <time dateTime={toIsoString(certificate.issueDate)}>
            {formatFullDate(certificate.issueDate, locale)}
          </time>
        </p>
      ) : null}

      {certificate.credentialUrl ? (
        <p className="mt-5">
          <a
            href={certificate.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm font-mono text-[13px] uppercase tracking-[0.06em] text-primary transition-colors hover:text-primary-hi focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t('verify')}
            <span aria-hidden>&rarr;</span>
          </a>
        </p>
      ) : null}
    </div>
  )

  if (wide) {
    return (
      <article className="rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-[var(--accent-line)] md:grid md:grid-cols-2 md:gap-8">
        {text}
        <div className="mt-6 flex flex-col gap-4 md:mt-0">
          {image}
          {chips}
        </div>
      </article>
    )
  }

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-[var(--accent-line)]">
      {image}
      {text}
      {chips ? <div className="mt-5">{chips}</div> : null}
    </article>
  )
}
