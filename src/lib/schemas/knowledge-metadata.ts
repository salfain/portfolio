import { z } from 'zod'

import {
  DEVICE_KEYS,
  FAULT_KEYS,
  IP_PLAN_KEYS,
  TEST_CASE_KEYS,
  TIMELINE_KEYS,
  VLAN_KEYS,
  parseTable,
} from '@/lib/knowledge-metadata'

/**
 * Metadata terstruktur per tipe dokumen.
 *
 * Bentuk dasarnya sudah ditetapkan dan disetujui di
 * `docs/phase-0/04_SEED_CONTENT_DRAFT.md` §4. Fase 6 memperluasnya dengan
 * blok bukti yang diminta `01_PHASES.md` — inventaris perangkat, rencana
 * IP/VLAN, kasus uji, simulasi gangguan, kronologi insiden.
 *
 * Disimpan di kolom `KnowledgeDocument.metadata` yang memang sudah ada,
 * jadi tidak ada migrasi. Kolom `Json` berarti bentuknya TIDAK dijaga
 * database — skema di berkas inilah satu-satunya yang menjaganya, di
 * kedua arah: saat menyimpan dari form, dan saat membaca untuk dirender.
 */

const table = <K extends string>(keys: readonly K[]) =>
  z
    .array(
      z.object(
        Object.fromEntries(keys.map((key) => [key, z.string().max(500)])) as {
          [P in K]: z.ZodString
        },
      ),
    )
    .max(200)
    .default([])

const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() !== '' ? value.trim() : null,
    z.string().max(max).nullable(),
  )

const optionalInt = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : typeof value === 'number'
          ? value
          : null,
    z.number().int().min(0).max(max).nullable(),
  )

// ─── SOP ─────────────────────────────────────────────────

export const sopMetadataSchema = z.object({
  kind: z.literal('SOP').default('SOP'),
  scope: optionalText(200),
  owner: optionalText(200),
  riskLevel: z.enum(['low', 'medium', 'high']).nullable().default(null),
})

// ─── Lab ─────────────────────────────────────────────────

export const labMetadataSchema = z.object({
  kind: z.literal('LAB').default('LAB'),
  topology: optionalText(300),
  estimatedHours: optionalInt(500),
  devices: table(DEVICE_KEYS),
  vlans: table(VLAN_KEYS),
  ipPlan: table(IP_PLAN_KEYS),
  testCases: table(TEST_CASE_KEYS),
  faults: table(FAULT_KEYS),
})

// ─── Insiden ─────────────────────────────────────────────

export const INCIDENT_PRIORITIES = ['P1', 'P2', 'P3', 'P4'] as const
export const INCIDENT_LEVELS = ['low', 'medium', 'high'] as const

/**
 * `isLabReproduction` WAJIB dan tidak punya default.
 *
 * `07_SCHEMA_DECISIONS.md` penyimpangan #8 menambahkannya justru untuk
 * mencegah insiden lab tampil sebagai insiden produksi. Nilai default
 * apa pun akan menjawab pertanyaan itu tanpa penulisnya sadar — dan
 * menyajikan skenario lab sebagai kejadian nyata adalah mengarang
 * pengalaman (CLAUDE.md aturan 1).
 */
export const incidentMetadataSchema = z.object({
  kind: z.literal('INCIDENT').default('INCIDENT'),
  number: optionalText(60),
  priority: z.enum(INCIDENT_PRIORITIES).nullable().default(null),
  impact: z.enum(INCIDENT_LEVELS).nullable().default(null),
  urgency: z.enum(INCIDENT_LEVELS).nullable().default(null),
  affectedService: optionalText(200),
  /** Hanya diisi bila waktunya benar-benar tercatat (04_SEED §4). */
  resolutionMinutes: optionalInt(100_000),
  isLabReproduction: z.boolean(),
  timeline: table(TIMELINE_KEYS),
  rootCauseId: optionalText(2000),
  rootCauseEn: optionalText(2000),
  workaroundId: optionalText(2000),
  workaroundEn: optionalText(2000),
  resolutionId: optionalText(2000),
  resolutionEn: optionalText(2000),
  validationId: optionalText(2000),
  validationEn: optionalText(2000),
  preventionId: optionalText(2000),
  preventionEn: optionalText(2000),
  relatedSopSlug: optionalText(120),
})

// ─── Artikel ─────────────────────────────────────────────

export const articleMetadataSchema = z.object({
  kind: z.literal('ARTICLE').default('ARTICLE'),
})

export const knowledgeMetadataSchema = z.discriminatedUnion('kind', [
  sopMetadataSchema,
  labMetadataSchema,
  incidentMetadataSchema,
  articleMetadataSchema,
])

export type SopMetadata = z.infer<typeof sopMetadataSchema>
export type LabMetadata = z.infer<typeof labMetadataSchema>
export type IncidentMetadata = z.infer<typeof incidentMetadataSchema>
export type KnowledgeMetadata = z.infer<typeof knowledgeMetadataSchema>

/**
 * Baca metadata yang tersimpan.
 *
 * Mengembalikan `null` bila bentuknya tidak cocok dengan tipe dokumennya —
 * pemanggil tidak merender bloknya, bukan melempar. Metadata rusak di satu
 * dokumen tidak boleh menjatuhkan seluruh halaman, dan blok bukti yang
 * hilang jauh lebih mudah disadari daripada halaman yang gagal dimuat.
 */
export function parseLabMetadata(value: unknown): LabMetadata | null {
  const parsed = labMetadataSchema.safeParse(withKind(value, 'LAB'))

  return parsed.success ? parsed.data : null
}

export function parseIncidentMetadata(value: unknown): IncidentMetadata | null {
  const parsed = incidentMetadataSchema.safeParse(withKind(value, 'INCIDENT'))

  return parsed.success ? parsed.data : null
}

export function parseSopMetadata(value: unknown): SopMetadata | null {
  const parsed = sopMetadataSchema.safeParse(withKind(value, 'SOP'))

  return parsed.success ? parsed.data : null
}

/**
 * Susun metadata dari isian form admin.
 *
 * Field metadata dikirim datar dengan awalan `meta`, lalu dirakit di sini
 * sesuai tipe dokumen. Tabel dikirim sebagai teks satu-entri-per-baris dan
 * diurai `parseTable`.
 *
 * `isLabReproduction` datang sebagai `'lab'`, `'nyata'`, atau string kosong.
 * Kosong sengaja TIDAK diterjemahkan menjadi `false`: skema menuntut boolean,
 * jadi penulis yang belum menjawab akan ditolak dengan pesan, bukan diam-diam
 * menerbitkan skenario lab sebagai kejadian nyata.
 */
export function metadataFromForm(
  type: string,
  form: Record<string, string>,
): z.SafeParseReturnType<unknown, KnowledgeMetadata> {
  if (type === 'LAB') {
    return labMetadataSchema.safeParse({
      kind: 'LAB',
      topology: form.metaTopology,
      estimatedHours: form.metaEstimatedHours,
      devices: parseTable(form.metaDevices, DEVICE_KEYS),
      vlans: parseTable(form.metaVlans, VLAN_KEYS),
      ipPlan: parseTable(form.metaIpPlan, IP_PLAN_KEYS),
      testCases: parseTable(form.metaTestCases, TEST_CASE_KEYS),
      faults: parseTable(form.metaFaults, FAULT_KEYS),
    })
  }

  if (type === 'INCIDENT') {
    const reproduction = form.metaIsLabReproduction

    return incidentMetadataSchema.safeParse({
      kind: 'INCIDENT',
      number: form.metaNumber,
      priority: emptyToNull(form.metaPriority),
      impact: emptyToNull(form.metaImpact),
      urgency: emptyToNull(form.metaUrgency),
      affectedService: form.metaAffectedService,
      resolutionMinutes: form.metaResolutionMinutes,
      isLabReproduction:
        reproduction === 'lab'
          ? true
          : reproduction === 'nyata'
            ? false
            : undefined,
      timeline: parseTable(form.metaTimeline, TIMELINE_KEYS),
      rootCauseId: form.metaRootCauseId,
      rootCauseEn: form.metaRootCauseEn,
      workaroundId: form.metaWorkaroundId,
      workaroundEn: form.metaWorkaroundEn,
      resolutionId: form.metaResolutionId,
      resolutionEn: form.metaResolutionEn,
      validationId: form.metaValidationId,
      validationEn: form.metaValidationEn,
      preventionId: form.metaPreventionId,
      preventionEn: form.metaPreventionEn,
      relatedSopSlug: form.metaRelatedSopSlug,
    })
  }

  if (type === 'SOP') {
    return sopMetadataSchema.safeParse({
      kind: 'SOP',
      scope: form.metaScope,
      owner: form.metaOwner,
      riskLevel: emptyToNull(form.metaRiskLevel),
    })
  }

  return articleMetadataSchema.safeParse({ kind: 'ARTICLE' })
}

function emptyToNull(value: string | undefined): string | null {
  return value === undefined || value.trim() === '' ? null : value
}

/**
 * Metadata lama tersimpan tanpa `kind` (bentuk 04_SEED §4 asli).
 *
 * Tipe dokumennya sudah diketahui pemanggil dari kolom `type`, jadi
 * `kind` ditambahkan di sini alih-alih menolak data yang sah hanya karena
 * ditulis sebelum discriminator ini ada.
 */
function withKind(value: unknown, kind: string): unknown {
  if (typeof value !== 'object' || value === null) return { kind }

  return { kind, ...(value as Record<string, unknown>) }
}
