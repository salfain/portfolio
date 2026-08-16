import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { getPublishedProjects } from '@/data/project'

import { EmptyState } from '@/components/ui'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { ProjectCard } from '@/components/project-card'
import { CardGridSkeleton } from '@/components/skeletons'
import { StaggerContainer, StaggerItem } from '@/components/motion'

export const revalidate = 3600

type PageProps = {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'projects' })

  return { title: t('title'), description: t('metaDescription') }
}

export default async function ProjectsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('projects')

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />

      <Container className="pb-20">
        {/*
          Boundary skeleton berada DI SINI, di dalam halaman listing — bukan
          di `loading.tsx`. Berkas itu memasang Suspense di atas seluruh
          subtree segmennya, termasuk `projects/[slug]` yang memanggil
          `notFound()`; shell ter-flush duluan dan 404 terkirim sebagai 200.
          Lihat docs/phase-5/NOTES.md N1 dan app/route-boundaries.test.ts.
        */}
        <Suspense fallback={<CardGridSkeleton columns={2} cards={4} />}>
          <ProjectsGrid locale={locale} />
        </Suspense>
      </Container>
    </>
  )
}

/** Bagian yang menunggu database. Dipisah supaya bisa di-Suspense. */
async function ProjectsGrid({ locale }: { locale: Locale }) {
  const t = await getTranslations('projects')
  const projects = await getPublishedProjects()

  if (projects.length === 0) {
    return (
      <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
    )
  }

  return (
    <StaggerContainer className="grid gap-5 md:grid-cols-2">
      {projects.map((project) => (
        <StaggerItem key={project.id}>
          <ProjectCard project={project} locale={locale} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
