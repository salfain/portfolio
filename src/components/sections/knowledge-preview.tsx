import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import type { DocumentCard as DocumentCardData } from '@/data/knowledge'

import { DocumentCard } from '@/components/knowledge'
import { StaggerContainer, StaggerItem } from '@/components/motion'

import { Section } from './section'

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
        <Link
          href="/knowledge"
          className="rounded-sm text-sm font-medium text-primary underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {tKnowledge('browseAll')} →
        </Link>
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
