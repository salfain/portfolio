import { setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import {
  TypeListing,
  typeListingMetadata,
} from '@/components/knowledge/type-listing'

// Rute STATIS, bukan segmen dinamis `[type]`: segmen yang tidak dikenal
// harus ditolak router dengan 404, bukan dirender lalu memanggil
// notFound() (yang membalas 200). Lihat type-listing.tsx.

type PageProps = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params

  return typeListingMetadata(locale, 'labs')
}

export default async function KnowledgeLabsPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <TypeListing
      locale={locale}
      segment="labs"
      searchParams={await searchParams}
    />
  )
}
