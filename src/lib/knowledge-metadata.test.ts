import { describe, expect, it } from 'vitest'

import {
  DEVICE_KEYS,
  IP_PLAN_KEYS,
  TEST_CASE_KEYS,
  normalizeTestStatus,
  parseTable,
  toTableText,
} from './knowledge-metadata'

describe('parseTable', () => {
  it('memecah kolom dan memangkas spasi', () => {
    const rows = parseTable('R1 |  Router  | CHR | inti', DEVICE_KEYS)

    expect(rows).toEqual([
      { name: 'R1', role: 'Router', model: 'CHR', note: 'inti' },
    ])
  })

  it('kolom yang kurang menjadi string kosong, barisnya tetap ada', () => {
    const rows = parseTable('SW1 | Switch', DEVICE_KEYS)

    expect(rows).toEqual([{ name: 'SW1', role: 'Switch', model: '', note: '' }])
  })

  it('membuang baris tanpa kolom pertama', () => {
    const rows = parseTable('| Router | CHR\nR2 | Router', DEVICE_KEYS)

    expect(rows).toHaveLength(1)
    expect(rows[0]?.name).toBe('R2')
  })

  it('mengabaikan baris kosong', () => {
    expect(parseTable('\n\n  \n', DEVICE_KEYS)).toEqual([])
  })

  it('menerima null dan undefined', () => {
    expect(parseTable(null, DEVICE_KEYS)).toEqual([])
    expect(parseTable(undefined, DEVICE_KEYS)).toEqual([])
  })

  it('kolom berlebih diabaikan, tidak merusak baris', () => {
    const rows = parseTable('A | B | C | D | E | F', DEVICE_KEYS)

    expect(rows[0]).toEqual({ name: 'A', role: 'B', model: 'C', note: 'D' })
  })
})

describe('toTableText', () => {
  it('bolak-balik menghasilkan isi yang sama', () => {
    const text = 'Kantor | 10.10.0.0/24 | 10 | 10.10.0.1'
    const rows = parseTable(text, IP_PLAN_KEYS)

    expect(toTableText(rows, IP_PLAN_KEYS)).toBe(text)
  })

  it('membuang kolom kosong di ujung kanan', () => {
    const rows = parseTable('SW1 | Switch', DEVICE_KEYS)

    expect(toTableText(rows, DEVICE_KEYS)).toBe('SW1 | Switch')
  })

  it('menerima null', () => {
    expect(toTableText(null, DEVICE_KEYS)).toBe('')
  })
})

/**
 * Status yang tidak terbaca TIDAK boleh menjadi "lulus". Lab yang
 * menampilkan centang hijau karena penulisnya salah ketik adalah bukti
 * yang berbohong.
 */
describe('normalizeTestStatus', () => {
  it('mengenali lulus dalam dua bahasa', () => {
    expect(normalizeTestStatus('pass')).toBe('pass')
    expect(normalizeTestStatus('Lulus')).toBe('pass')
    expect(normalizeTestStatus('  OK  ')).toBe('pass')
  })

  it('mengenali gagal dan terhalang', () => {
    expect(normalizeTestStatus('gagal')).toBe('fail')
    expect(normalizeTestStatus('FAIL')).toBe('fail')
    expect(normalizeTestStatus('blocked')).toBe('blocked')
  })

  it('nilai tak dikenal menjadi unknown, bukan pass', () => {
    expect(normalizeTestStatus('mungkin')).toBe('unknown')
    expect(normalizeTestStatus('')).toBe('unknown')
    expect(normalizeTestStatus('pas')).toBe('unknown')
  })

  it('status kasus uji ikut terbaca dari tabel', () => {
    const rows = parseTable(
      'T1 | ping antar VLAN | balasan diterima | balasan diterima | lulus',
      TEST_CASE_KEYS,
    )

    expect(normalizeTestStatus(rows[0]?.status ?? '')).toBe('pass')
  })
})
