import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { ProjectCard as Project } from '@/data/project'

import { EmptyState } from '@/components/ui'
import { ProjectCard } from '@/components/project-card'
import { StaggerContainer, StaggerItem } from '@/components/motion'

import { Section } from './section'
import { SectionLink } from './section-link'

type FeaturedWorkProps = {
  projects: Project[]
  locale: Locale
}

export async function FeaturedWork({ projects, locale }: FeaturedWorkProps) {
  const t = await getTranslations('featured')

  return (
    <Section
      id="featured"
      title={t('title')}
      description={t('description')}
      action={
        projects.length > 0 ? (
          <SectionLink href="/projects">{t('viewAll')}</SectionLink>
        ) : null
      }
    >
      {projects.length === 0 ? (
        <EmptyState
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      ) : (
        <StaggerContainer className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} locale={locale} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </Section>
  )
}
