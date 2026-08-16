import { type HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

/**
 * Blok penanda konten yang sedang dimuat.
 *
 * Memakai sapuan gradien (`skeleton-shimmer`), bukan `animate-pulse`:
 * pulse yang meredup-terang mudah tertukar dengan elemen nonaktif,
 * sedangkan sapuan yang bergerak searah jelas berarti "sedang berjalan".
 *
 * Saat `prefers-reduced-motion: reduce`, aturan global di globals.css
 * menghentikan animasinya dan blok ini tetap terlihat sebagai bidang
 * `bg-elevated` — tetap menyampaikan bentuk halaman tanpa gerakan.
 *
 * `aria-hidden`: skeleton adalah tekstur visual. Yang diumumkan ke pembaca
 * layar adalah status wadahnya (lihat `SkeletonRegion`), bukan puluhan
 * kotak kosong satu per satu.
 */
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn('skeleton-shimmer rounded-xl bg-elevated', className)}
      {...props}
    />
  )
}

/** Beberapa baris teks dengan lebar terakhir dipendekkan. */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            'h-4 rounded-full',
            // Baris terakhir dibuat lebih pendek supaya terbaca sebagai
            // paragraf, bukan blok padat.
            index === lines - 1
              ? 'w-4/6'
              : index % 3 === 1
                ? 'w-5/6'
                : 'w-full',
          )}
        />
      ))}
    </div>
  )
}

/** Kerangka satu kartu — dipakai listing proyek dan dokumen. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-border bg-surface p-6',
        className,
      )}
    >
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-6 w-3/4 rounded-lg" />
      <SkeletonText lines={2} className="mt-3" />
      <div className="mt-6 flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  )
}

/**
 * Pembungkus yang mengumumkan status memuat ke pembaca layar.
 *
 * `aria-busy` + satu teks `sr-only` sekali saja — jauh lebih berguna
 * daripada membiarkan setiap kotak skeleton ikut dibacakan.
 */
export function SkeletonRegion({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}
