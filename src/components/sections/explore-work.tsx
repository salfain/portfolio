import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { features } from '@/lib/features'

import { Card, CardBody } from '@/components/ui'
import { StaggerContainer, StaggerItem } from '@/components/motion'

import { Section } from './section'

type ExploreLink = {
  href: string
  key: 'projects' | 'experience' | 'expertise' | 'certifications' | 'knowledge' | 'recruiter'
  /** Disembunyikan sampai fase yang bersangkutan selesai. */
  enabled: boolean
}

const exploreLinks: ExploreLink[] = [
  { href: '/projects', key: 'projects', enabled: true },
  { href: '/experience', key: 'experience', enabled: true },
  { href: '/expertise', key: 'expertise', enabled: true },
  { href: '/certifications', key: 'certifications', enabled: true },
  { href: '/knowledge', key: 'knowledge', enabled: features.knowledgeBase },
  { href: '/recruiter', key: 'recruiter', enabled: true },
]

/**
 * Panel "Jelajahi Pekerjaan Saya" — jalur cepat ke seluruh bagian
 * portofolio, ditaruh tepat di bawah hero supaya recruiter tidak
 * perlu menggulir mencari apa yang ada di situs ini.
 */
export async function ExploreWork() {
  const t = await getTranslations('explore')

  return (
    <Section id="explore" title={t('title')} description={t('description')}>
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exploreLinks
          .filter((link) => link.enabled)
          .map((link) => (
            <StaggerItem key={link.href}>
              <Card className="relative h-full transition-colors hover:border-primary/40">
                <CardBody>
                  <h3 className="font-display text-base font-semibold">
                    <Link
                      href={link.href}
                      className="rounded-sm after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {t(`items.${link.key}.title`)}
                    </Link>
                  </h3>
                  <p className="text-justified mt-2 text-sm leading-relaxed text-muted">
                    {t(`items.${link.key}.description`)}
                  </p>
                </CardBody>
              </Card>
            </StaggerItem>
          ))}
      </StaggerContainer>
    </Section>
  )
}
