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
      className="scroll-mt-28 border-t border-border py-14 md:py-16"
    >
      <Container>
        <Reveal>
          <div className="rounded-[28px] border border-border bg-surface px-6 py-16 text-center sm:px-12 md:px-12 md:py-20">
            <h2
              id="contact-cta-heading"
              className="font-display text-[clamp(38px,5vw,64px)] leading-[1.05] tracking-[-0.02em]"
            >
              {t('title')}
            </h2>
            {/* `text-center` diulang di sini, bukan diwarisi: aturan dasar
                `p { text-align: justify }` mengalahkan perataan yang
                diwariskan induk, jadi tanpa kelas ini paragraf akan
                kembali rata kiri-kanan. */}
            <p className="mx-auto mt-5 max-w-[54ch] text-center text-lg leading-relaxed text-muted">
              {t('description')}
            </p>

            <div className="mx-auto mt-10 grid max-w-md gap-3 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/contact">{t('getInTouch')}</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <Link href="/recruiter">{t('recruiterSummary')}</Link>
              </Button>

              {cvUrl ? (
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="w-full sm:w-auto"
                >
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
