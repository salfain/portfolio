import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { DocumentCard as DocumentCardData } from '@/data/knowledge'

import { DocumentCard } from '@/components/knowledge'
import { StaggerContainer, StaggerItem } from '@/components/motion'

import { Section } from './section'
import { SectionLink } from './section-link'

/**
 * Bagian 10 beranda — pratinjau Knowledge Base.
 *
 * Tidak dirender sama sekali saat belum ada dokumen terbit: bagian
 * "Dari Knowledge Base" yang kosong justru menandakan situs belum jadi.
 */
export async function KnowledgePreview({
  documents,
  locale,
}: {
  documents: DocumentCardData[]
  locale: Locale
}) {
  if (documents.length === 0) return null

  const t = await getTranslations('home')
  const tKnowledge = await getTranslations('knowledge')

  return (
    <Section
      id="knowledge"
      title={t('fromKnowledgeBase')}
      description={tKnowledge('description')}
      action={
        <SectionLink href="/knowledge">{tKnowledge('browseAll')}</SectionLink>
      }
    >
      <StaggerContainer className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => (
          <StaggerItem key={document.id}>
            <DocumentCard document={document} locale={locale} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </Section>
  )
}
