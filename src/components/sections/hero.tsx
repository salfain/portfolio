import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { features } from '@/lib/features'
import { resolveLocalized } from '@/lib/i18n-content'
import type { PublicProfile } from '@/data/profile'

import { Badge, Button } from '@/components/ui'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion'

type HeroProps = {
  profile: PublicProfile | null
  locale: Locale
}

export async function Hero({ profile, locale }: HeroProps) {
  const t = await getTranslations('hero')

  /**
   * Saat `SiteProfile` belum diisi lewat admin, hero jatuh ke teks
   * dasar yang SUDAH final di PRD bab 1 dan dikutip apa adanya di
   * docs/phase-0/03_PROFILE_COPY.md §1 — bukan teks karangan.
   * Tidak ada angka, lama pengalaman, atau klaim pencapaian di sini.
   */
  const role = profile
    ? resolveLocalized(profile, 'role', locale)
    : { value: t('fallbackRole'), lang: locale }

  const headline = profile
    ? resolveLocalized(profile, 'headline', locale)
    : { value: t('fallbackHeadline'), lang: locale }

  const summary = profile ? resolveLocalized(profile, 'summary', locale) : null
  const availability = profile
    ? resolveLocalized(profile, 'availability', locale)
    : null

  const cvUrl = locale === 'en' ? profile?.cvEnUrl : profile?.cvIdUrl

  return (
    <section className="py-16 md:py-24 lg:py-28">
      <Container>
        <div className="grid min-w-0 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <Reveal className="min-w-0 max-w-prose">
            {availability?.value ? (
              <Badge variant="success" className="mb-6">
                <span lang={availability.lang}>{availability.value}</span>
              </Badge>
            ) : null}

            <p
              lang={role.lang}
              className="text-sm font-medium uppercase tracking-widest text-primary"
            >
              {role.value}
            </p>

            <h1
              lang={headline.lang}
              className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl"
            >
              {headline.value}
            </h1>

            {summary?.value ? (
              <p
                lang={summary.lang}
                className="mt-6 text-base leading-relaxed text-muted md:text-lg"
              >
                {summary.value}
              </p>
            ) : null}

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/projects">{t('viewPortfolio')}</Link>
              </Button>

              {/* Knowledge Base baru ada di Fase 4 — sampai itu tautannya
                  disembunyikan, bukan mengarah ke 404. */}
              {features.knowledgeBase ? (
                <Button asChild size="lg" variant="secondary">
                  <Link href="/knowledge">{t('exploreKnowledge')}</Link>
                </Button>
              ) : null}

              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">{t('getInTouch')}</Link>
              </Button>

              {/* Tombol CV hanya muncul kalau berkasnya benar-benar ada. */}
              {cvUrl ? (
                <Button asChild size="lg" variant="ghost">
                  <a href={cvUrl} download>
                    {t('downloadCv')}
                  </a>
                </Button>
              ) : null}
            </div>
          </Reveal>

          {profile?.profileImageUrl ? (
            <Reveal delay={0.1} className="order-first lg:order-none">
              <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-4xl border border-border bg-surface md:h-64 md:w-64 lg:h-72 lg:w-72">
                <Image
                  src={profile.profileImageUrl}
                  alt={profile.name}
                  fill
                  sizes="(max-width: 768px) 192px, 288px"
                  className="object-cover"
                  priority
                />
              </div>
            </Reveal>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
