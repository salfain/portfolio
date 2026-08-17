import { getTranslations } from 'next-intl/server'

import { groupSkillsByCategory, type PublicSkill } from '@/data/skill'

import { EmptyState } from '@/components/ui'
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
 * dilakukan (00_CONTENT_INVENTORY §3), dan hanya muncul bila memang
 * membedakan sesuatu — lihat catatan di dalam.
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
        <StaggerContainer>
          {visible.map((group) => {
            /**
             * Level hanya ditampilkan bila di dalam satu kategori memang
             * ADA perbedaan. Kalau seluruh item bernilai sama — dan saat
             * ini semuanya "Berpengalaman" — label itu terulang di setiap
             * baris tanpa membedakan apa pun, jadi yang tersisa hanya
             * kebisingan yang harus dilewati mata belasan kali.
             * Begitu sebagian diisi nilai lain lewat admin, labelnya
             * muncul kembali dengan sendirinya.
             */
            const levels = new Set(
              group.skills.map((skill) => skill.level).filter(Boolean),
            )
            const showLevel = levels.size > 1

            return (
              <StaggerItem
                key={group.category}
                className="grid gap-x-10 gap-y-5 border-t border-border py-8 md:grid-cols-[240px_minmax(0,1fr)]"
              >
                <h3 className="font-display text-[22px] leading-tight">
                  {group.category}
                </h3>

                {/* Dua kolom: memangkas tinggi baris dan memendekkan
                    barisnya, jadi nama yang panjang berhenti membungkus. */}
                <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {group.skills.map((skill) => (
                    <li
                      key={skill.id}
                      className="flex items-baseline gap-3 text-[15px] text-text-2"
                    >
                      <span
                        aria-hidden
                        className="mt-2 h-[3px] w-[3px] shrink-0 rounded-full bg-primary"
                      />
                      <span className="min-w-0">
                        {skill.name}
                        {showLevel && skill.level ? (
                          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.06em] text-faint">
                            {skill.level}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      )}
    </Section>
  )
}
