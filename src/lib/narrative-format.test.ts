import { describe, expect, it } from 'vitest'

import {
  pairNarrativeBlocks,
  parseNarrativeText,
  toNarrativeText,
} from '@/lib/narrative-format'

describe('parseNarrativeText', () => {
  it('memisah blok per baris kosong', () => {
    const result = parseNarrativeText('Judul A | Isi A\n\nJudul B | Isi B')

    expect(result).toEqual([
      { title: 'Judul A', body: 'Isi A' },
      { title: 'Judul B', body: 'Isi B' },
    ])
  })

  it('hanya memakai tanda | pertama sebagai pemisah', () => {
    const result = parseNarrativeText('Judul | Isi dengan | pipa di dalamnya')

    expect(result).toEqual([
      { title: 'Judul', body: 'Isi dengan | pipa di dalamnya' },
    ])
  })

  it('menyatukan baris tunggal di dalam satu blok', () => {
    const result = parseNarrativeText('Judul | Baris satu\nbaris dua')

    expect(result[0]?.body).toBe('Baris satu baris dua')
  })

  it('membuang blok tanpa judul', () => {
    expect(parseNarrativeText('Isi tanpa pemisah sama sekali')).toEqual([])
  })

  it('membuang blok tanpa isi', () => {
    expect(parseNarrativeText('Judul saja |')).toEqual([])
  })

  it('mengabaikan baris kosong berlebih', () => {
    const result = parseNarrativeText('A | satu\n\n\n\n   \n\nB | dua')

    expect(result).toHaveLength(2)
  })

  it('teks kosong menghasilkan array kosong', () => {
    expect(parseNarrativeText('')).toEqual([])
    expect(parseNarrativeText('   \n\n  ')).toEqual([])
  })
})

describe('pairNarrativeBlocks', () => {
  const id = [
    { title: 'Judul A', body: 'Isi A' },
    { title: 'Judul B', body: 'Isi B' },
  ]

  it('memasangkan berdasarkan urutan', () => {
    const result = pairNarrativeBlocks(id, [
      { title: 'Title A', body: 'Body A' },
      { title: 'Title B', body: 'Body B' },
    ])

    expect(result[0]).toEqual({
      titleId: 'Judul A',
      bodyId: 'Isi A',
      titleEn: 'Title A',
      bodyEn: 'Body A',
    })
  })

  it('Inggris kosong menghasilkan null, bukan string kosong', () => {
    const result = pairNarrativeBlocks(id, [])

    expect(result[0]?.titleEn).toBeNull()
    expect(result[0]?.bodyEn).toBeNull()
    expect(result).toHaveLength(2)
  })
})

describe('toNarrativeText', () => {
  it('bolak-balik menghasilkan teks yang sama', () => {
    const source = 'Judul A | Isi A\n\nJudul B | Isi B'
    const blocks = pairNarrativeBlocks(parseNarrativeText(source), [])

    expect(toNarrativeText(blocks, 'id')).toBe(source)
  })

  it('melewati blok yang bahasa Inggrisnya belum ada', () => {
    const blocks = pairNarrativeBlocks(parseNarrativeText('A | satu'), [])

    expect(toNarrativeText(blocks, 'en')).toBe('')
  })
})
