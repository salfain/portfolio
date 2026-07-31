import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { groupSkillsByCategory, type PublicSkill } from '@/data/skill'

import { Badge, Card, CardBody, EmptyState } from '@/components/ui'
import { StaggerContainer, StaggerItem } from '@/components/motion'

import { Section } from './section'

type CapabilitiesProps = {
  skills: PublicSkill[]
  /** Homepage menampilkan ringkasannya saja; /expertise menampilkan semua. */
  compact?: boolean
}

/**
 * Level ditampilkan sebagai teks (Dasar / Menengah / Mahir), bukan bar
 * persentase. Persentase menyiratkan pengukuran yang tidak pernah
 * dilakukan (00_CONTENT_INVENTORY §3).
 *
 * `category` dan `level` adalah data yang diisi pemilik lewat admin,
 * jadi ditampilkan apa adanya — bukan lewat kunci terjemahan.
 */
export async function Capabilities({
  skills,
  compact = false,
}: CapabilitiesProps) {
  const t = await getTranslations('capabilities')
  const groups = groupSkillsByCategory(skills)
  const visible = compact ? groups.slice(0, 3) : groups

  return (
    <Section
      id="capabilities"
      title={t('title')}
      description={t('description')}
      action={
        compact && groups.length > 0 ? (
          <Link
            href="/expertise"
            className="rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t('viewAll')}
          </Link>
        ) : null
      }
    >
      {visible.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((group) => (
            <StaggerItem key={group.category}>
              <Card className="h-full">
                <CardBody>
                  <h3 className="font-display text-base font-semibold">
                    {group.category}
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {group.skills.map((skill) => (
                      <li
                        key={skill.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span>{skill.name}</span>
                        {skill.level ? (
                          <Badge className="shrink-0">{skill.level}</Badge>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </Section>
  )
}
