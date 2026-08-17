import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { PublicCertificate } from '@/data/certificate'

import { EmptyState } from '@/components/ui'
import { StaggerContainer, StaggerItem } from '@/components/motion'
import { CertificateCard } from '@/components/certificate-card'

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
        <StaggerContainer className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((certificate) => (
            <StaggerItem key={certificate.id}>
              <CertificateCard certificate={certificate} locale={locale} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </Section>
  )
}
