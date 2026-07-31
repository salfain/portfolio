import { describe, expect, it } from 'vitest'

import {
  formatFullDate,
  formatMonthYear,
  formatPeriod,
  formatYear,
  toIsoString,
} from '@/lib/format'

// Tanggal UTC yang, di Asia/Jakarta (UTC+7), jatuh pada 1 Januari 2024.
// Dipilih sengaja: di UTC tanggalnya masih 31 Desember 2023, jadi tes ini
// gagal bila zona waktunya lupa dipasang.
const NEW_YEAR_JAKARTA = new Date('2023-12-31T18:00:00.000Z')

describe('formatFullDate', () => {
  it('format Indonesia', () => {
    expect(formatFullDate(new Date('2026-07-31T03:00:00.000Z'), 'id')).toBe(
      '31 Juli 2026',
    )
  })

  it('format Inggris', () => {
    expect(formatFullDate(new Date('2026-07-31T03:00:00.000Z'), 'en')).toBe(
      '31 July 2026',
    )
  })

  it('memakai zona waktu Asia/Jakarta, bukan UTC', () => {
    expect(formatFullDate(NEW_YEAR_JAKARTA, 'id')).toBe('1 Januari 2024')
  })
})

describe('formatMonthYear', () => {
  it('memakai zona waktu Asia/Jakarta', () => {
    expect(formatMonthYear(NEW_YEAR_JAKARTA, 'en')).toContain('2024')
  })
})

describe('formatPeriod', () => {
  const start = new Date('2024-01-15T03:00:00.000Z')
  const end = new Date('2025-06-15T03:00:00.000Z')

  it('menyusun rentang dengan tanggal akhir', () => {
    const result = formatPeriod(start, end, 'en', 'Present')
    expect(result).toContain('2024')
    expect(result).toContain('2025')
    expect(result).not.toContain('Present')
  })

  it('memakai label "sekarang" bila tanggal akhir kosong', () => {
    expect(formatPeriod(start, null, 'id', 'Sekarang')).toContain('Sekarang')
  })

  it('label "sekarang" datang dari pemanggil, bukan dirakit di dalam', () => {
    expect(formatPeriod(start, null, 'en', 'Present')).toContain('Present')
  })
})

describe('tanggal dari unstable_cache (string ISO)', () => {
  // unstable_cache menyimpan hasilnya sebagai JSON: saat cache MISS nilainya
  // Date asli, saat cache HIT nilainya string ISO. Tipe Prisma tetap bilang
  // Date, jadi TypeScript tidak menangkapnya dan halaman baru rusak SETELAH
  // cache terisi. Tes ini mengunci kedua bentuk. Lihat docs/phase-4/NOTES.md N1.
  const iso = '2026-03-15T00:00:00.000Z'
  const date = new Date(iso)

  it('formatFullDate menerima Date maupun string', () => {
    expect(formatFullDate(iso, 'id')).toBe(formatFullDate(date, 'id'))
    expect(formatFullDate(iso, 'en')).toBe(formatFullDate(date, 'en'))
  })

  it('formatMonthYear menerima keduanya', () => {
    expect(formatMonthYear(iso, 'id')).toBe(formatMonthYear(date, 'id'))
  })

  it('formatYear menerima keduanya', () => {
    expect(formatYear(iso, 'id')).toBe(formatYear(date, 'id'))
  })

  it('formatPeriod menerima keduanya', () => {
    expect(formatPeriod(iso, iso, 'id', 'Sekarang')).toBe(
      formatPeriod(date, date, 'id', 'Sekarang'),
    )
  })

  it('toIsoString mengembalikan ISO dari Date maupun string', () => {
    expect(toIsoString(date)).toBe(iso)
    expect(toIsoString(iso)).toBe(iso)
  })
})
