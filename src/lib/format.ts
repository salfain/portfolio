import type { Locale } from '@/i18n/routing'

/**
 * Format tanggal terlokalisasi.
 *
 * Seluruh tanggal diformat di Server Component dengan zona waktu tetap
 * `Asia/Jakarta`. Memformat dengan zona waktu server yang berbeda dari
 * klien menyebabkan hydration mismatch.
 *
 * Lihat docs/phase-0/08_I18N_FALLBACK_POLICY.md §7.
 */

const TIME_ZONE = 'Asia/Jakarta'

// en-GB dipakai (bukan en-US) supaya urutannya "31 July 2026",
// sejajar dengan format Indonesia "31 Juli 2026".
const intlLocale: Record<Locale, string> = {
  id: 'id-ID',
  en: 'en-GB',
}

/**
 * Tanggal bisa datang sebagai `Date` ATAU string ISO.
 *
 * `unstable_cache` menyimpan hasilnya sebagai JSON. Saat cache MISS,
 * fungsi data mengembalikan `Date` asli dari Prisma; saat cache HIT, nilai
 * yang sama kembali sebagai string ISO. Tipe Prisma tetap menyebutnya
 * `Date`, jadi TypeScript TIDAK menangkap perbedaan ini.
 *
 * Akibatnya `date.toISOString()` melempar "is not a function" — tapi hanya
 * setelah cache terisi, jadi build pertama yang bersih selalu lolos dan
 * kerusakannya baru muncul di produksi.
 *
 * Karena itu SELURUH tanggal wajib lewat helper di berkas ini.
 * Lihat docs/phase-4/NOTES.md N1.
 */
export type DateLike = Date | string

function toDate(value: DateLike): Date {
  return value instanceof Date ? value : new Date(value)
}

/** Nilai untuk atribut `dateTime` pada `<time>`. */
export function toIsoString(value: DateLike): string {
  return toDate(value).toISOString()
}

/** `31 Juli 2026` · `31 July 2026` */
export function formatFullDate(date: DateLike, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(toDate(date))
}

/** `Jul 2026` — dipakai untuk periode pengalaman kerja. */
export function formatMonthYear(date: DateLike, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    month: 'short',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(toDate(date))
}

/** `2026` */
export function formatYear(date: DateLike, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(toDate(date))
}

/**
 * `Jan 2024 – Sekarang` · `Jan 2024 – Present`
 *
 * `presentLabel` wajib dioper dari kunci terjemahan — label "Sekarang"
 * adalah string UI, jadi tidak boleh dirakit di sini.
 */
export function formatPeriod(
  start: DateLike,
  end: DateLike | null,
  locale: Locale,
  presentLabel: string,
): string {
  const from = formatMonthYear(start, locale)
  const to = end ? formatMonthYear(end, locale) : presentLabel

  return `${from} – ${to}`
}
