import type { KnowledgeType } from '@prisma/client'

/**
 * Pemetaan segmen URL ↔ enum tipe dokumen.
 *
 * Segmen URL sengaja TIDAK sama dengan nilai enum: `/knowledge/labs`
 * terbaca wajar, `/knowledge/LAB` tidak. Pemetaannya ditaruh di satu
 * tempat supaya rute, navigasi, dan sitemap tidak bisa berbeda.
 *
 * Segmen tidak diterjemahkan — `05_ROUTE_AND_PRIORITY_MAP.md` §2
 * mencantumkan jalur yang sama untuk kedua locale, dan URL yang berubah
 * saat ganti bahasa memutus tautan yang sudah dibagikan.
 */
export const TYPE_SEGMENTS = {
  sop: 'SOP',
  labs: 'LAB',
  incidents: 'INCIDENT',
  articles: 'ARTICLE',
} as const satisfies Record<string, KnowledgeType>

export type TypeSegment = keyof typeof TYPE_SEGMENTS

export const TYPE_SEGMENT_LIST = Object.keys(TYPE_SEGMENTS) as TypeSegment[]

/** Kunci terjemahan per tipe, di namespace `knowledge.types`. */
export const TYPE_KEYS: Record<KnowledgeType, string> = {
  SOP: 'sop',
  LAB: 'labs',
  INCIDENT: 'incidents',
  ARTICLE: 'articles',
}

export function isTypeSegment(value: string): value is TypeSegment {
  return value in TYPE_SEGMENTS
}

export function typeForSegment(segment: TypeSegment): KnowledgeType {
  return TYPE_SEGMENTS[segment]
}

/** Kebalikannya — dipakai kartu dokumen untuk menyusun tautan detail. */
export function segmentForType(type: KnowledgeType): TypeSegment {
  return TYPE_KEYS[type] as TypeSegment
}

export function documentHref(type: KnowledgeType, slug: string): string {
  return `/knowledge/${segmentForType(type)}/${slug}`
}
