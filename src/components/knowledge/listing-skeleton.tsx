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
      <div className="h-64 animate-pulse rounded-2xl bg-elevated" />

      <div className="grid gap-5 sm:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-2xl bg-elevated"
          />
        ))}
      </div>
    </div>
  )
}
