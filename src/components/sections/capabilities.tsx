import { getTranslations } from 'next-intl/server'

import { groupSkillsByCategory, type PublicSkill } from '@/data/skill'

import { Card, CardBody, EmptyState } from '@/components/ui'
import { StaggerContainer, StaggerItem } from '@/components/motion'

import { Section } from './section'
import { SectionLink } from './section-link'

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
          <SectionLink href="/expertise">{t('viewAll')}</SectionLink>
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
          {visible.map((group) => (
            <StaggerItem key={group.category}>
              <Card className="h-full">
                <CardBody className="p-7">
                  {/* Nama kategori berperan sebagai kicker: mono, huruf
                      besar, warna aksen. Isinya tetap judul <h3>. */}
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                    {group.category}
                  </h3>
                  <ul className="mt-5 flex flex-col gap-[11px]">
                    {group.skills.map((skill) => (
                      <li
                        key={skill.id}
                        className="flex items-baseline justify-between gap-4 text-[15px] text-text-2"
                      >
                        <span>{skill.name}</span>

                        {/* Level ditulis sebagai teks mono redup, BUKAN chip
                            berpil. Nilainya bisa sepanjang "Berpengalaman";
                            dengan bingkai pil, huruf besar, dan tracking
                            lebar, label itu menjadi lebih lebar daripada
                            nama keahlian yang diterangkannya dan memaksa
                            namanya membungkus. Level adalah keterangan,
                            jadi harus kalah menonjol dari namanya. */}
                        {skill.level ? (
                          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.06em] text-faint">
                            {skill.level}
                          </span>
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
