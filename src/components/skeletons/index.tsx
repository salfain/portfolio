import { getTranslations } from 'next-intl/server'

import {
  Skeleton,
  SkeletonCard,
  SkeletonRegion,
  SkeletonText,
} from '@/components/ui'
import { Container } from '@/components/layout/container'

/**
 * Kerangka halaman yang bentuknya MENGIKUTI isi sebenarnya.
 *
 * Skeleton generik yang sama untuk semua halaman tidak jauh berbeda dari
 * layar kosong. Yang berguna adalah kerangka yang sudah menempati posisi
 * judul, kartu, dan sidebar yang akan muncul — jadi begitu datanya tiba,
 * tata letaknya tidak melompat.
 */

function HeaderSkeleton() {
  return (
    <div className="border-b border-border py-8 md:py-12">
      <Container>
        <Skeleton className="h-10 w-2/3 max-w-md rounded-2xl md:h-12" />
        <SkeletonText lines={2} className="mt-5 max-w-none" />
      </Container>
    </div>
  )
}

/** Listing berkartu: proyek, dokumen per tipe, kategori, tag. */
export async function ListingSkeleton({
  columns = 3,
  cards = 6,
  withSidebar = false,
}: {
  columns?: 2 | 3
  cards?: number
  withSidebar?: boolean
}) {
  const t = await getTranslations('a11y')

  return (
    <SkeletonRegion label={t('loadingList')}>
      <HeaderSkeleton />

      <Container className="pb-20">
        <div
          className={
            withSidebar
              ? 'grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]'
              : undefined
          }
        >
          {withSidebar ? (
            <aside className="space-y-5 rounded-3xl border border-border bg-surface p-6">
              <Skeleton className="h-5 w-32 rounded-full" />
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="mt-2 h-11 w-full rounded-xl" />
                </div>
              ))}
            </aside>
          ) : null}

          <div
            className={
              columns === 2
                ? 'grid gap-5 sm:grid-cols-2'
                : 'grid gap-5 md:grid-cols-2 lg:grid-cols-3'
            }
          >
            {Array.from({ length: cards }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </Container>
    </SkeletonRegion>
  )
}

/** Halaman dokumen: isi panjang di kiri, daftar isi di kanan. */
export async function DocumentSkeleton() {
  const t = await getTranslations('a11y')

  return (
    <SkeletonRegion label={t('loadingDocument')}>
      <Container className="py-8 md:py-12">
        <Skeleton className="h-4 w-40 rounded-full" />

        <div className="mt-6 max-w-none">
          <div className="flex gap-3">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-11 w-full rounded-2xl md:h-14" />
          <SkeletonText lines={2} className="mt-5" />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="min-w-0 space-y-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-6 w-1/3 rounded-lg" />
                <SkeletonText lines={4} className="mt-4" />
              </div>
            ))}
            {/* Blok perintah — hampir selalu ada di SOP dan lab. */}
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>

          <aside className="space-y-3">
            <Skeleton className="h-4 w-28 rounded-full" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full rounded-full" />
            ))}
          </aside>
        </div>
      </Container>
    </SkeletonRegion>
  )
}

/** Halaman naratif satu kolom: Tentang, Privasi, Ketentuan. */
export async function ProseSkeleton() {
  const t = await getTranslations('a11y')

  return (
    <SkeletonRegion label={t('loading')}>
      <HeaderSkeleton />

      <Container className="py-8">
        <div className="max-w-none space-y-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-6 w-1/3 rounded-lg" />
              <SkeletonText lines={4} className="mt-4" />
            </div>
          ))}
        </div>
      </Container>
    </SkeletonRegion>
  )
}
