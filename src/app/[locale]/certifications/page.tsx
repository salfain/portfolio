import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { getPublishedCertificates } from '@/data/certificate'

import { EmptyState } from '@/components/ui'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { CertificateCard } from '@/components/certificate-card'
import { StaggerContainer, StaggerItem } from '@/components/motion'

export const revalidate = 3600

type PageProps = {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'certifications' })

  return { title: t('title'), description: t('metaDescription') }
}

export default async function CertificationsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('certifications')
  const certificates = await getPublishedCertificates()

  // `slice` alih-alih destrukturisasi: TypeScript menganggap elemen
  // pertama sebuah array bisa `undefined`, dan cabang kosong sudah
  // ditangani di bawah.
  const [featured] = certificates.slice(0, 1)
  const rest = certificates.slice(1)

  return (
    <>
      {/* Judul halaman "Sertifikat" dengan kicker "Sertifikasi &
          Pembelajaran" di atasnya, sesuai `Sertifikasi.dc.html`. Di beranda
          frasa panjang itu tetap dipakai sebagai judul bagian. */}
      <PageHeader
        kicker={t('pageKicker')}
        title={t('pageTitle')}
        description={t('description')}
      />

      <Container className="pb-24">
        {!featured ? (
          <EmptyState
            title={t('emptyTitle')}
            description={t('emptyDescription')}
          />
        ) : (
          /* Kredensial pertama memakai kartu lebar dua kolom. Sisanya dua
             per baris. Grid-nya satu kolom di bawah `md`, jadi kartu lebar
             ikut menumpuk tanpa aturan tambahan. */
          <StaggerContainer className="grid gap-5 md:grid-cols-2">
            <StaggerItem className="md:col-span-2">
              <CertificateCard certificate={featured} locale={locale} wide />
            </StaggerItem>

            {rest.map((certificate) => (
              <StaggerItem key={certificate.id}>
                <CertificateCard certificate={certificate} locale={locale} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </Container>
    </>
  )
}
