import { z } from 'zod'

/**
 * Filter listing Knowledge Base, dibaca dari `searchParams`.
 *
 * Seluruh state filter ada di URL — kriteria penerimaan Fase 4. Artinya
 * hasil filter bisa ditandai, dibagikan, dan tombol Back peramban bekerja
 * seperti yang diharapkan.
 *
 * Nilai yang tidak dikenal diabaikan, bukan menghasilkan galat: URL yang
 * dibagikan bisa saja memuat filter dari versi situs yang lebih lama, dan
 * halaman error untuk itu adalah reaksi yang berlebihan.
 */
export const knowledgeFiltersSchema = z.object({
  q: z.string().trim().min(1).max(100).optional().catch(undefined),
  kategori: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/)
    .max(80)
    .optional()
    .catch(undefined),
  tag: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/)
    .max(80)
    .optional()
    .catch(undefined),
  tingkat: z
    .enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
    .optional()
    .catch(undefined),
})

export type KnowledgeFilters = z.infer<typeof knowledgeFiltersSchema>

/** Parse `searchParams` Next.js (nilainya bisa berupa array). */
export function parseKnowledgeFilters(
  searchParams: Record<string, string | string[] | undefined>,
): KnowledgeFilters {
  const flat = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  )

  return knowledgeFiltersSchema.parse(flat)
}

/** Apakah ada filter aktif? Menentukan tampil-tidaknya tombol "reset". */
export function hasActiveFilters(filters: KnowledgeFilters): boolean {
  return Object.values(filters).some((value) => value !== undefined)
}

/**
 * Susun query string dari filter, membuang yang kosong.
 *
 * Nilai kosong dibuang supaya URL tidak menumpuk `?q=&tag=` yang membuat
 * dua URL berbeda menampilkan halaman yang sama persis.
 */
export function buildFilterQuery(filters: Partial<KnowledgeFilters>): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === 'string' && value.trim() !== '') {
      params.set(key, value)
    }
  }

  const query = params.toString()

  return query === '' ? '' : `?${query}`
}
