import { describe, expect, it } from 'vitest'

import {
  pickLocale,
  isLocaleComplete,
  resolveLocalized,
} from '@/lib/i18n-content'

describe('pickLocale', () => {
  it('mengembalikan field Id untuk locale id', () => {
    const doc = { titleId: 'Judul', titleEn: 'Title' }
    expect(pickLocale(doc, 'title', 'id')).toBe('Judul')
  })

  it('mengembalikan field En bila ada untuk locale en', () => {
    const doc = { titleId: 'Judul', titleEn: 'Title' }
    expect(pickLocale(doc, 'title', 'en')).toBe('Title')
  })

  it('fallback ke Id bila field En kosong (locale en)', () => {
    const doc = { titleId: 'Judul', titleEn: '' }
    expect(pickLocale(doc, 'title', 'en')).toBe('Judul')
  })

  it('fallback ke Id bila field En undefined (locale en)', () => {
    const doc = { titleId: 'Judul' }
    expect(pickLocale(doc, 'title', 'en')).toBe('Judul')
  })

  it('fallback ke Id bila field En hanya whitespace', () => {
    const doc = { titleId: 'Judul', titleEn: '   ' }
    expect(pickLocale(doc, 'title', 'en')).toBe('Judul')
  })

  it('mengembalikan string kosong bila Id juga tidak ada', () => {
    const doc = { titleId: '', titleEn: 'Title' }
    expect(pickLocale(doc, 'title', 'id')).toBe('')
  })
})

describe('resolveLocalized', () => {
  it('locale id menandai bahasa isi sebagai id', () => {
    const doc = { titleId: 'Judul', titleEn: 'Title' }
    expect(resolveLocalized(doc, 'title', 'id')).toEqual({
      value: 'Judul',
      lang: 'id',
      isFallback: false,
    })
  })

  it('locale en dengan terjemahan menandai bahasa isi sebagai en', () => {
    const doc = { titleId: 'Judul', titleEn: 'Title' }
    expect(resolveLocalized(doc, 'title', 'en')).toEqual({
      value: 'Title',
      lang: 'en',
      isFallback: false,
    })
  })

  // Inti aturan WCAG 3.1.2: teks Indonesia di halaman /en wajib
  // ditandai lang="id", bukan lang="en".
  it('locale en tanpa terjemahan menandai bahasa isi sebagai id', () => {
    const doc = { titleId: 'Judul', titleEn: '' }
    expect(resolveLocalized(doc, 'title', 'en')).toEqual({
      value: 'Judul',
      lang: 'id',
      isFallback: true,
    })
  })

  it('field En berisi whitespace tetap dihitung sebagai fallback', () => {
    const doc = { titleId: 'Judul', titleEn: '  ' }
    expect(resolveLocalized(doc, 'title', 'en').isFallback).toBe(true)
  })
})

describe('isLocaleComplete', () => {
  const requiredEnFields = ['title', 'summary'] as const

  it('locale id selalu lengkap', () => {
    const doc = { titleId: 'Judul', summaryId: 'Ringkasan' }
    expect(isLocaleComplete(doc, 'id', requiredEnFields)).toBe(true)
  })

  it('locale en lengkap bila semua field wajib terisi', () => {
    const doc = {
      titleId: 'Judul',
      titleEn: 'Title',
      summaryId: 'Ringkasan',
      summaryEn: 'Summary',
    }
    expect(isLocaleComplete(doc, 'en', requiredEnFields)).toBe(true)
  })

  it('locale en tidak lengkap bila satu field En kosong', () => {
    const doc = {
      titleId: 'Judul',
      titleEn: 'Title',
      summaryId: 'Ringkasan',
      summaryEn: '',
    }
    expect(isLocaleComplete(doc, 'en', requiredEnFields)).toBe(false)
  })

  it('locale en tidak lengkap bila field En undefined', () => {
    const doc = {
      titleId: 'Judul',
      titleEn: 'Title',
      summaryId: 'Ringkasan',
    }
    expect(isLocaleComplete(doc, 'en', requiredEnFields)).toBe(false)
  })
})
