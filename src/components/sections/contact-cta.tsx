import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import type { PublicProfile } from '@/data/profile'

import { Button } from '@/components/ui'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion'

type ContactCtaProps = {
  profile: PublicProfile | null
  locale: Locale
}

/**
 * Bagian penutup homepage.
 *
 * Email dan nomor telepon TIDAK ditampilkan di sini — Q10
 * (06_OPEN_QUESTIONS) belum dijawab, jadi jalan tengah yang
 * disarankan dokumen itu yang dipakai: kontak langsung hanya di
 * halaman Recruiter Mode, selebihnya lewat form.
 */
export async function ContactCta({ profile, locale }: ContactCtaProps) {
  const t = await getTranslations('contactCta')
  const cvUrl = locale === 'en' ? profile?.cvEnUrl : profile?.cvIdUrl

  return (
    <section
      id="contact-cta"
      aria-labelledby="contact-cta-heading"
      className="scroll-mt-24 py-16 md:py-20"
    >
      <Container>
        <Reveal>
          <div className="rounded-4xl border border-border bg-surface px-6 py-12 text-center sm:px-12">
            <h2
              id="contact-cta-heading"
              className="font-display text-2xl font-semibold tracking-tight md:text-3xl"
            >
              {t('title')}
            </h2>
            <p className="mx-auto mt-3 max-w-prose text-base leading-relaxed text-muted">
              {t('description')}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/contact">{t('getInTouch')}</Link>
              </Button>

              <Button asChild size="lg" variant="secondary">
                <Link href="/recruiter">{t('recruiterSummary')}</Link>
              </Button>

              {cvUrl ? (
                <Button asChild size="lg" variant="ghost">
                  <a href={cvUrl} download>
                    {t('downloadCv')}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
