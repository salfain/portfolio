import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatFullDate } from '@/lib/format'
import type { PublicCertificate } from '@/data/certificate'

import { Badge, Card, CardBody, EmptyState } from '@/components/ui'
import { StaggerContainer, StaggerItem } from '@/components/motion'

import { Section } from './section'

type CertificationsListProps = {
  certificates: PublicCertificate[]
  locale: Locale
  limit?: number
}

/**
 * Sertifikat tanpa `credentialUrl` tetap ditampilkan, tapi TANPA
 * penanda terverifikasi — penanda itu menjanjikan sesuatu yang tidak
 * bisa dibuktikan pembaca (00_CONTENT_INVENTORY §4).
 */
export async function CertificationsList({
  certificates,
  locale,
  limit,
}: CertificationsListProps) {
  const t = await getTranslations('certifications')
  const visible = limit ? certificates.slice(0, limit) : certificates

  return (
    <Section
      id="certifications"
      title={t('title')}
      action={
        limit && certificates.length > limit ? (
          <Link
            href="/certifications"
            className="rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t('viewAll')}
          </Link>
        ) : null
      }
    >
      {visible.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((certificate) => (
            <StaggerItem key={certificate.id}>
              <Card className="h-full">
                <CardBody className="flex h-full flex-col">
                  <h3 className="font-display text-base font-semibold leading-snug">
                    {certificate.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{certificate.issuer}</p>

                  {certificate.issueDate ? (
                    <p className="mt-3 text-sm text-muted">
                      <time
                        dateTime={certificate.issueDate.toISOString()}
                      >
                        {formatFullDate(certificate.issueDate, locale)}
                      </time>
                    </p>
                  ) : null}

                  {certificate.skills.length > 0 ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {certificate.skills.map((skill) => (
                        <li key={skill}>
                          <Badge>{skill}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {certificate.credentialUrl ? (
                    <p className="mt-auto pt-5">
                      <a
                        href={certificate.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {t('verify')}
                      </a>
                    </p>
                  ) : null}
                </CardBody>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </Section>
  )
}
