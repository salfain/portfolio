import type { Locale } from '@/i18n/routing'

/**
 * Entitas dengan pasangan field bilingual *Id / *En.
 * Field opsional (En boleh kosong); Id selalu wajib.
 */
export type LocalizedField<T extends string> = `${T}Id` | `${T}En`

type LocalePair = Record<string, unknown>

/**
 * Pilih field sesuai locale dengan fallback aman:
 *  - locale 'id' → field 'Id'
 *  - locale 'en' + field 'En' ada & non-kosong → field 'En'
 *  - locale 'en' + field 'En' kosong → field 'Id' (fallback)
 *
 * Lihat docs/phase-0/08_I18N_FALLBACK_POLICY.md §3.
 */
export function pickLocale<T extends LocalePair>(
  entity: T,
  field: string,
  locale: Locale,
): string {
  const idValue = entity[`${field}Id`]
  const enValue = entity[`${field}En`]

  if (locale === 'en' && typeof enValue === 'string' && enValue.trim() !== '') {
    return enValue
  }

  if (typeof idValue === 'string') {
    return idValue
  }

  // Catatan: tidak ada guard di sini — pemanggil dijamin field 'Id' wajib
  // di skema (07_SCHEMA_DECISIONS). Bila kosong, string kosong lebih aman
  // daripada throw di tengah render halaman publik.
  return ''
}

/**
 * Sama seperti `pickLocale`, tapi ikut mengembalikan bahasa isi yang
 * benar-benar dirender.
 *
 * Dipakai untuk atribut `lang` pada elemen pembungkus: teks Indonesia
 * yang muncul di halaman `/en` wajib ditandai `lang="id"`, kalau tidak
 * pembaca layar melafalkannya dengan fonetik Inggris. Ini persyaratan
 * WCAG 3.1.2, bukan penyempurnaan opsional.
 *
 * Lihat docs/phase-0/08_I18N_FALLBACK_POLICY.md §3 (Bungkus bahasa).
 */
export function resolveLocalized<T extends LocalePair>(
  entity: T,
  field: string,
  locale: Locale,
): { value: string; lang: Locale; isFallback: boolean } {
  const enValue = entity[`${field}En`]
  const hasEn = typeof enValue === 'string' && enValue.trim() !== ''
  const isFallback = locale === 'en' && !hasEn

  return {
    value: pickLocale(entity, field, locale),
    lang: isFallback ? 'id' : locale,
    isFallback,
  }
}

/**
 * Apakah entitas lengkap dalam locale tertentu?
 * Untuk 'id' selalu true (bahasa utama, wajib).
 * Untuk 'en' — semua field wajib EN (per tipe entitas) terisi non-kosong.
 *
 * Definisi field wajib EN per entitas: 08_I18N_FALLBACK_POLICY.md §2.
 */
export function isLocaleComplete<T extends LocalePair>(
  entity: T,
  locale: Locale,
  requiredEnFields: readonly string[],
): boolean {
  if (locale === 'id') return true

  return requiredEnFields.every((field) => {
    const value = entity[`${field}En`]
    return typeof value === 'string' && value.trim() !== ''
  })
}
