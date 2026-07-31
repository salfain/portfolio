import { describe, expect, it } from 'vitest'

import {
  documentHref,
  isTypeSegment,
  segmentForType,
  TYPE_SEGMENT_LIST,
  typeForSegment,
} from '@/lib/knowledge-type'
import {
  buildFilterQuery,
  hasActiveFilters,
  parseKnowledgeFilters,
} from '@/lib/schemas/knowledge-filters'

describe('pemetaan tipe dokumen', () => {
  it('bolak-balik segmen ↔ enum konsisten', () => {
    // Kalau pemetaannya tidak simetris, kartu dokumen akan menautkan ke
    // segmen yang berbeda dari yang dirender listing.
    for (const segment of TYPE_SEGMENT_LIST) {
      expect(segmentForType(typeForSegment(segment))).toBe(segment)
    }
  })

  it('mengenali segmen yang sah', () => {
    expect(isTypeSegment('sop')).toBe(true)
    expect(isTypeSegment('labs')).toBe(true)
    expect(isTypeSegment('SOP')).toBe(false)
    expect(isTypeSegment('apapun')).toBe(false)
  })

  it('menyusun tautan detail', () => {
    expect(documentHref('LAB', 'lab-vlan-departemen')).toBe(
      '/knowledge/labs/lab-vlan-departemen',
    )
  })
})

describe('parseKnowledgeFilters', () => {
  it('membaca filter yang sah', () => {
    expect(
      parseKnowledgeFilters({
        q: 'dhcp',
        kategori: 'jaringan',
        tag: 'vlan',
        tingkat: 'INTERMEDIATE',
      }),
    ).toEqual({
      q: 'dhcp',
      kategori: 'jaringan',
      tag: 'vlan',
      tingkat: 'INTERMEDIATE',
    })
  })

  it('mengabaikan nilai tidak sah tanpa melempar', () => {
    // URL yang dibagikan bisa memuat filter dari versi situs lebih lama;
    // halaman error untuk itu berlebihan.
    const result = parseKnowledgeFilters({
      tingkat: 'DEWA',
      kategori: 'Kategori Dengan Spasi',
      tag: '../../etc/passwd',
    })

    expect(result.tingkat).toBeUndefined()
    expect(result.kategori).toBeUndefined()
    expect(result.tag).toBeUndefined()
  })

  it('mengambil nilai pertama bila searchParams berupa array', () => {
    expect(parseKnowledgeFilters({ q: ['dhcp', 'dns'] }).q).toBe('dhcp')
  })

  it('kata kunci kosong dianggap tidak ada', () => {
    expect(parseKnowledgeFilters({ q: '   ' }).q).toBeUndefined()
  })
})

describe('hasActiveFilters', () => {
  it('false saat tidak ada filter', () => {
    expect(hasActiveFilters(parseKnowledgeFilters({}))).toBe(false)
  })

  it('true saat ada satu filter', () => {
    expect(hasActiveFilters(parseKnowledgeFilters({ tag: 'vlan' }))).toBe(true)
  })
})

describe('buildFilterQuery', () => {
  it('mengosongkan query saat tidak ada filter', () => {
    expect(buildFilterQuery({})).toBe('')
  })

  it('membuang nilai kosong', () => {
    // Kalau tidak, ?q=&tag= membuat dua URL berbeda menampilkan halaman
    // yang sama persis.
    expect(buildFilterQuery({ q: '', tag: 'vlan' })).toBe('?tag=vlan')
  })

  it('meng-encode karakter khusus', () => {
    expect(buildFilterQuery({ q: 'dhcp gagal' })).toBe('?q=dhcp+gagal')
  })
})
