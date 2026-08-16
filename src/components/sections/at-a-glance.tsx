import { getTranslations } from 'next-intl/server'

import { features } from '@/lib/features'
import type { CareerStats } from '@/data/stats'

import { Card, CardBody } from '@/components/ui'
import { StaggerContainer, StaggerItem } from '@/components/motion'

import { Section } from './section'

type AtAGlanceProps = {
  stats: CareerStats
}

/**
 * Bagian "Ringkasan / At a Glance".
 *
 * Judulnya sengaja BUKAN "Career Metrics": judul bernuansa metrik
 * menuntut angka, dan angka yang tidak tercatat tidak akan diisi
 * dengan tebakan (03_PROFILE_COPY §8).
 *
 * Setiap angka di sini dihitung dari database. Kartu bernilai 0
 * disembunyikan, jadi tata letak tetap rapi dengan berapa pun
 * kartu yang tersisa.
 */
export async function AtAGlance({ stats }: AtAGlanceProps) {
  const t = await getTranslations('glance')

  const cards = [
    { key: 'projects' as const, value: stats.projects, enabled: true },
    {
      key: 'sops' as const,
      value: stats.sops,
      enabled: features.knowledgeBase,
    },
    {
      key: 'labs' as const,
      value: stats.labs,
      enabled: features.knowledgeBase,
    },
    {
      key: 'incidents' as const,
      value: stats.incidents,
      enabled: features.knowledgeBase,
    },
    { key: 'certificates' as const, value: stats.certificates, enabled: true },
  ].filter((card) => card.enabled && card.value > 0)

  if (cards.length === 0) return null

  return (
    <Section id="glance" title={t('title')}>
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <StaggerItem key={card.key}>
            <Card className="h-full">
              <CardBody>
                <p className="font-display text-4xl tabular-nums">
                  {card.value}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {t(`items.${card.key}`)}
                </p>
              </CardBody>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </Section>
  )
}
