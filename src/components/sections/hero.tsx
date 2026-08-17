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
   * Kolom kanan grid hanya terisi kalau ada foto profil atau baris info.
   * Tanpa keduanya,
   * `max-w-prose` menyisakan sekitar 40% lebar layar kosong di kanan —
   * jadi teksnya dibiarkan memakai lebar Container penuh.
   */
  type InfoRow = {
    label: string
    value: string
    lang?: string
    accent?: boolean
  }

  /**
   * Handoff memuat tiga baris: Lokasi, Fokus, Tersedia.
   *
   * "Fokus" tidak punya kolom di `SiteProfile`, dan memakai `role` untuk
   * mengisinya hanya mengulang teks yang sudah tercetak di atas judul.
   * "Tersedia" dibaca dari `availability`, yang SUDAH tampil sebagai
   * indikator bertitik di kiri — menampilkannya dua kali di satu layar
   * membuat keduanya terbaca seperti dua status yang berbeda.
   *
   * Yang tersisa satu baris, dan itu memang seluruh data yang ada.
   */
  const infoRows: InfoRow[] = [
    profile?.location
      ? { label: t('infoLocation'), value: profile.location }
      : null,
  ].filter((row) => row !== null)

  return (
    <section className="pb-16 pt-4 md:pb-20 md:pt-8">
      <Container>
        <div className="grid min-w-0 items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <Reveal
            className={cn(
              'animate-rise min-w-0',
              profile?.profileImageUrl || infoRows.length > 0
                ? 'max-w-prose'
                : 'max-w-none',
            )}
          >
            {/* Penanda ketersediaan: titik aksen dengan halo, lalu teks
                mono. Statusnya datang dari profil, bukan ditulis di sini. */}
            {availability?.value ? (
              <p className="mb-5 flex items-center gap-3">
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

            <p lang={role.lang} className="kicker mb-4 text-primary">
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
                className="mt-6 max-w-[58ch] text-[17px] leading-relaxed text-muted"
              >
                {summary.value}
              </p>
            ) : null}

            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
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

          {profile?.profileImageUrl || infoRows.length > 0 ? (
            <Reveal delay={0.1} className="lg:w-[320px]">
              {profile?.profileImageUrl ? (
                <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-2xl border border-border bg-surface md:h-64 md:w-64 lg:h-72 lg:w-full">
                  <Image
                    src={profile.profileImageUrl}
                    alt={profile.name}
                    fill
                    sizes="(max-width: 768px) 192px, 320px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : null}

              {infoRows.length > 0 ? (
                <dl
                  className={cn(
                    'rounded-3xl border border-border bg-surface px-6',
                    profile?.profileImageUrl && 'mt-5',
                  )}
                >
                  {infoRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-col gap-1.5 border-b border-border py-5 last:border-b-0"
                    >
                      <dt className="kicker">{row.label}</dt>
                      <dd
                        lang={row.lang}
                        className={cn(
                          'text-[15px]',
                          row.accent ? 'text-primary' : 'text-text-2',
                        )}
                      >
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </Reveal>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
