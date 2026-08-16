import { Skeleton, SkeletonCard } from '@/components/ui'

/**
 * Skeleton hasil listing — bukan spinner (05_ROUTE_AND_PRIORITY_MAP §5).
 *
 * Sebelumnya skeleton dipasang lewat `src/app/[locale]/loading.tsx`. Berkas
 * itu memasang Suspense boundary di atas SELURUH subtree locale, termasuk
 * rute detail yang memanggil `notFound()` — dan boundary itulah yang membuat
 * setiap 404 terkirim sebagai 200. Lihat docs/phase-5/NOTES.md N1.
 *
 * Karena itu boundary-nya sekarang berada DI DALAM halaman listing, yang
 * memang tidak pernah memanggil `notFound()`.
 */
export function ListingSkeleton() {
  return (
    <div
      className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]"
      aria-hidden="true"
    >
      {/* Panel filter: judul mono pendek lalu empat pasang label + kontrol,
          mengikuti bentuk knowledge-filters supaya tata letak tidak
          melompat begitu datanya tiba. */}
      <aside className="space-y-5 rounded-3xl border border-border bg-surface p-6">
        <Skeleton className="h-4 w-28 rounded-full" />
        {[0, 1, 2, 3].map((index) => (
          <div key={index}>
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="mt-2 h-11 w-full rounded-md" />
          </div>
        ))}
      </aside>

      <div className="grid gap-5 sm:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  )
}
