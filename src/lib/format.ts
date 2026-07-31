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

/** `31 Juli 2026` · `31 July 2026` */
export function formatFullDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(date)
}

/** `Jul 2026` — dipakai untuk periode pengalaman kerja. */
export function formatMonthYear(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    month: 'short',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(date)
}

/** `2026` */
export function formatYear(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(date)
}

/**
 * `Jan 2024 – Sekarang` · `Jan 2024 – Present`
 *
 * `presentLabel` wajib dioper dari kunci terjemahan — label "Sekarang"
 * adalah string UI, jadi tidak boleh dirakit di sini.
 */
export function formatPeriod(
  start: Date,
  end: Date | null,
  locale: Locale,
  presentLabel: string,
): string {
  const from = formatMonthYear(start, locale)
  const to = end ? formatMonthYear(end, locale) : presentLabel

  return `${from} – ${to}`
}
