import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { formatFullDate, toIsoString } from '@/lib/format'
import type { PublicCertificate } from '@/data/certificate'

import { Badge, Card, CardBody, EmptyState } from '@/components/ui'
import { StaggerContainer, StaggerItem } from '@/components/motion'
import { CertificateLightbox } from '@/components/certificate-lightbox'

import { Section } from './section'
import { SectionLink } from './section-link'

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
          <SectionLink href="/certifications">{t('viewAll')}</SectionLink>
        ) : null
      }
    >
      {visible.length === 0 ? (
        <EmptyState
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      ) : (
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((certificate) => (
            <StaggerItem key={certificate.id}>
              <Card className="h-full">
                <CardBody className="flex h-full flex-col p-7">
                  {certificate.imageUrl ? (
                    <CertificateLightbox
                      name={certificate.name}
                      issuer={certificate.issuer}
                      imageUrl={certificate.imageUrl}
                      skills={certificate.skills}
                      credentialUrl={certificate.credentialUrl}
                      /* Tanggal diformat di server: `formatFullDate`
                         bergantung pada locale halaman, dan memformatnya
                         di klien akan memakai locale peramban. */
                      meta={[
                        certificate.issueDate
                          ? {
                              label: t('issued'),
                              value: formatFullDate(
                                certificate.issueDate,
                                locale,
                              ),
                            }
                          : null,
                        certificate.expiryDate
                          ? {
                              label: t('validUntil'),
                              value: formatFullDate(
                                certificate.expiryDate,
                                locale,
                              ),
                            }
                          : null,
                      ].filter((row) => row !== null)}
                      labels={{
                        open: t('openImage', { name: certificate.name }),
                        close: t('closeImage'),
                        verify: t('verify'),
                      }}
                    />
                  ) : null}

                  {/* Penerbit didahulukan sebagai kicker mono — nama
                      sertifikat sering panjang dan mirip satu sama lain,
                      penerbitnya yang membedakan sekilas pandang. */}
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
                    {certificate.issuer}
                  </p>
                  <h3 className="mt-3 text-[19px] font-medium leading-snug">
                    {certificate.name}
                  </h3>

                  {certificate.issueDate ? (
                    <p className="mt-2 text-[15px] text-muted">
                      <time dateTime={toIsoString(certificate.issueDate)}>
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
                    <p className="mt-auto pt-6">
                      <a
                        href={certificate.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-sm font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {t('verify')}
                        <span aria-hidden>&rarr;</span>
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
