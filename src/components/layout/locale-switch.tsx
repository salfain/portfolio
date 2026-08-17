'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'

import { usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

/**
 * Toggle locale ID ↔ EN pada rute yang sedang dibuka.
 *
 * Tiga hal yang ditangani di sini, dan ketiganya pernah salah:
 *
 * 1. **Posisi gulir dipertahankan.** Next.js melompat ke atas pada setiap
 *    navigasi. Untuk ganti bahasa itu keliru — pengunjung yang sedang
 *    membaca bagian "Validasi" di tengah SOP panjang ingin membaca bagian
 *    yang sama dalam bahasa lain, bukan kembali ke judul. `scroll: false`
 *    mematikannya.
 *
 * 2. **Query string ikut terbawa.** `usePathname()` dari next-intl hanya
 *    mengembalikan jalur tanpa `?`. Tanpa penanganan ini, mengganti bahasa
 *    di `/knowledge/sop?q=dhcp&tag=vlan` membuang seluruh filter dan
 *    pengunjung harus menyaring ulang dari nol.
 *
 *    Dibaca dari `window.location.search` di dalam handler, BUKAN lewat
 *    `useSearchParams()`. Komponen ini hidup di navbar, yang ikut ke
 *    layout setiap halaman — memakai `useSearchParams()` di sana menuntut
 *    batas Suspense dan membuat halaman statis jatuh ke render klien.
 *
 * 3. **Ada umpan balik saat menunggu.** Ganti bahasa memicu permintaan ke
 *    server. Tanpa penanda, tombolnya terasa mati selama jeda itu.
 */
export function LocaleSwitch({
  /**
   * Dipanggil tepat sebelum navigasi. Dipakai drawer mobile untuk menutup
   * dirinya — tanpa ini, drawer tetap terbuka menutupi halaman setelah
   * bahasa berganti, dan pengunjung harus menutupnya manual untuk melihat
   * hasil yang baru saja mereka minta.
   */
  onNavigate,
}: {
  onNavigate?: () => void
} = {}) {
  const t = useTranslations('locale')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const nextLocale = locale === 'id' ? 'en' : 'id'
  const label = locale === 'id' ? t('switchToEn') : t('switchToId')

  function handleClick() {
    // Hash tidak ikut: anchor `#validasi` menunjuk id yang diturunkan dari
    // JUDUL, dan judulnya berbeda antar bahasa. Membawanya serta akan
    // melompat ke anchor yang tidak ada di bahasa tujuan.
    const search = window.location.search

    onNavigate?.()

    startTransition(() => {
      router.replace(`${pathname}${search}`, {
        locale: nextLocale,
        scroll: false,
      })
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={label}
      title={label}
      className={cn(
        // min-h-11: chip-nya terlihat ramping, tapi area sentuhnya tetap
        // memenuhi batas 44px di 02_STYLING §9.
        'inline-flex min-h-11 items-center gap-0.5 rounded-md',
        'border border-border-med px-1 font-mono text-xs',
        'disabled:opacity-60',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      )}
    >
      {/* Kedua bahasa selalu terlihat: yang aktif diberi permukaan, yang
          lain redup. Panah "ID → EN" versi lama hanya menampilkan tujuan,
          jadi bahasa yang sedang aktif harus ditebak dari isi halaman. */}
      {(['id', 'en'] as const).map((code) => (
        <span
          key={code}
          aria-hidden
          className={cn(
            'rounded-[7px] px-2 py-1 transition-colors',
            code === locale ? 'bg-surface text-foreground' : 'text-muted',
          )}
        >
          {code.toUpperCase()}
        </span>
      ))}
    </button>
  )
}
