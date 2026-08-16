import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { features } from '@/lib/features'
import { resolveLocalized } from '@/lib/i18n-content'
import type { PublicProfile } from '@/data/profile'

import { Button } from '@/components/ui'
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

  /**
   * Kolom kanan grid hanya terisi kalau foto profil ada. Tanpa foto,
   * `max-w-prose` menyisakan sekitar 40% lebar layar kosong di kanan —
   * jadi teksnya dibiarkan memakai lebar Container penuh.
   */
  const hasPortrait = Boolean(profile?.profileImageUrl)

  return (
    <section className="pb-20 pt-20 md:pb-24 md:pt-28">
      <Container>
        <div className="grid min-w-0 items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <Reveal
            className={cn(
              'animate-rise min-w-0',
              hasPortrait ? 'max-w-prose' : 'max-w-none',
            )}
          >
            {/* Penanda ketersediaan: titik aksen dengan halo, lalu teks
                mono. Statusnya datang dari profil, bukan ditulis di sini. */}
            {availability?.value ? (
              <p className="mb-7 flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-[7px] w-[7px] shrink-0 rounded-full bg-primary shadow-[0_0_0_4px_var(--accent-glow)]"
                />
                <span
                  lang={availability.lang}
                  className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-2"
                >
                  {availability.value}
                </span>
              </p>
            ) : null}

            <p lang={role.lang} className="kicker mb-5 text-primary">
              {role.value}
            </p>

            <h1
              lang={headline.lang}
              className="break-words font-display text-display"
            >
              {headline.value}
            </h1>

            {summary?.value ? (
              <p
                lang={summary.lang}
                className="mt-7 max-w-[52ch] text-[19px] leading-relaxed text-muted"
              >
                {summary.value}
              </p>
            ) : null}

            <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/projects">{t('viewPortfolio')}</Link>
              </Button>

              {/* Knowledge Base baru ada di Fase 4 — sampai itu tautannya
                  disembunyikan, bukan mengarah ke 404. */}
              {features.knowledgeBase ? (
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  <Link href="/knowledge">{t('exploreKnowledge')}</Link>
                </Button>
              ) : null}

              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <Link href="/contact">{t('getInTouch')}</Link>
              </Button>

              {/* Tombol CV hanya muncul kalau berkasnya benar-benar ada. */}
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
          </Reveal>

          {profile?.profileImageUrl ? (
            <Reveal delay={0.1} className="order-first lg:order-none">
              <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-2xl border border-border bg-surface md:h-64 md:w-64 lg:h-72 lg:w-72">
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
