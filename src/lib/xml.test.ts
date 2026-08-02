import { describe, expect, it } from 'vitest'

import { escapeXml } from './xml'

describe('escapeXml', () => {
  it('melolos kelima karakter khusus XML', () => {
    expect(escapeXml(`& < > " '`)).toBe('&amp; &lt; &gt; &quot; &apos;')
  })

  /**
   * Urutan penggantian menentukan. Bila `&` tidak diganti lebih dulu,
   * `&` dari `&lt;` ikut diganti lagi dan hasilnya `&amp;lt;`.
   */
  it('tidak melolos ganda', () => {
    expect(escapeXml('<judul>')).toBe('&lt;judul&gt;')
    expect(escapeXml('a & b < c')).toBe('a &amp; b &lt; c')
  })

  it('judul yang wajar tidak berubah', () => {
    expect(escapeXml('Mengatasi jaringan lambat di kantor')).toBe(
      'Mengatasi jaringan lambat di kantor',
    )
  })

  it('menangani judul yang memuat entitas HTML mentah', () => {
    expect(escapeXml('SOP &amp; prosedur')).toBe('SOP &amp;amp; prosedur')
  })

  it('menutup upaya menyisipkan tag ke dalam umpan', () => {
    expect(escapeXml('</title><script>alert(1)</script>')).toBe(
      '&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;',
    )
  })

  it('string kosong tetap kosong', () => {
    expect(escapeXml('')).toBe('')
  })
})
