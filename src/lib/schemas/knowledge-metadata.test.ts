import { describe, expect, it } from 'vitest'

import {
  incidentMetadataSchema,
  labMetadataSchema,
  parseIncidentMetadata,
  parseLabMetadata,
} from './knowledge-metadata'

describe('metadata lab', () => {
  it('menerima metadata kosong — lab boleh terbit tanpa tabel apa pun', () => {
    const result = labMetadataSchema.safeParse({ kind: 'LAB' })

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.devices).toEqual([])
  })

  it('menerima bentuk lama dari 04_SEED §4 yang belum punya kind', () => {
    const parsed = parseLabMetadata({
      topology: 'HQ dan cabang',
      estimatedHours: 8,
    })

    expect(parsed?.topology).toBe('HQ dan cabang')
    expect(parsed?.estimatedHours).toBe(8)
  })

  it('menolak jumlah jam yang tidak masuk akal', () => {
    expect(
      labMetadataSchema.safeParse({ kind: 'LAB', estimatedHours: 99999 })
        .success,
    ).toBe(false)
  })

  it('metadata rusak menghasilkan null, bukan lemparan', () => {
    expect(parseLabMetadata({ devices: 'bukan tabel' })).toBeNull()
    expect(parseLabMetadata('bukan objek')).not.toBeUndefined()
  })
})

describe('metadata insiden', () => {
  const base = { kind: 'INCIDENT' as const, isLabReproduction: false }

  /**
   * Penyimpangan #8 di 07_SCHEMA_DECISIONS ada justru untuk mencegah
   * insiden lab tampil sebagai insiden produksi. Nilai default apa pun
   * akan menjawab pertanyaan itu tanpa penulisnya sadar.
   */
  it('MENOLAK insiden tanpa isLabReproduction', () => {
    const result = incidentMetadataSchema.safeParse({ kind: 'INCIDENT' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.path.includes('isLabReproduction'),
        ),
      ).toBe(true)
    }
  })

  it('menerima insiden yang menyatakan dirinya reproduksi lab', () => {
    const result = incidentMetadataSchema.safeParse({
      ...base,
      isLabReproduction: true,
    })

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.isLabReproduction).toBe(true)
  })

  it('hanya menerima prioritas P1 sampai P4', () => {
    expect(
      incidentMetadataSchema.safeParse({ ...base, priority: 'P2' }).success,
    ).toBe(true)
    expect(
      incidentMetadataSchema.safeParse({ ...base, priority: 'P9' }).success,
    ).toBe(false)
  })

  it('waktu penyelesaian boleh kosong — hanya diisi bila tercatat', () => {
    const result = incidentMetadataSchema.safeParse({
      ...base,
      resolutionMinutes: '',
    })

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.resolutionMinutes).toBeNull()
  })

  it('membaca kronologi sebagai daftar', () => {
    const result = incidentMetadataSchema.safeParse({
      ...base,
      timeline: [
        { at: '09:10', event: 'Laporan pertama masuk' },
        { at: '09:25', event: 'Penyebab teridentifikasi' },
      ],
    })

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.timeline).toHaveLength(2)
  })

  it('insiden tanpa isLabReproduction menghasilkan null saat dibaca', () => {
    // Dokumen lama yang metadatanya belum lengkap tidak boleh diam-diam
    // dianggap insiden nyata.
    expect(parseIncidentMetadata({ priority: 'P2' })).toBeNull()
  })
})
