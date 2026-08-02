import { describe, expect, it } from 'vitest'

import { knowledgeDocumentSchema } from './admin'

/**
 * Yang dikunci di sini adalah aturan yang kalau lepas menghasilkan
 * kerusakan senyap, bukan error: dokumen terbit tanpa konfirmasi redaksi,
 * isi rusak yang lolos ke kolom Json, dan tag ganda.
 */

const doc = JSON.stringify({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'isi' }] }],
})

function form(overrides: Record<string, string> = {}) {
  return {
    type: 'SOP',
    slug: 'sop-uji',
    version: '1.0',
    titleId: 'Judul dokumen uji',
    summaryId: 'Ringkasan yang panjangnya cukup untuk lolos validasi.',
    contentIdJson: doc,
    status: 'DRAFT',
    sortOrder: '0',
    ...overrides,
  }
}

function fieldError(result: ReturnType<typeof knowledgeDocumentSchema.safeParse>) {
  return result.success
    ? null
    : result.error.issues.map((issue) => issue.path.join('.'))
}

describe('knowledgeDocumentSchema', () => {
  it('menerima draft tanpa konfirmasi redaksi', () => {
    expect(knowledgeDocumentSchema.safeParse(form()).success).toBe(true)
  })

  it('MENOLAK terbit tanpa konfirmasi redaksi', () => {
    const result = knowledgeDocumentSchema.safeParse(
      form({ status: 'PUBLISHED' }),
    )

    expect(result.success).toBe(false)
    expect(fieldError(result)).toContain('redactionConfirmed')
  })

  it('menerima terbit dengan konfirmasi redaksi', () => {
    const result = knowledgeDocumentSchema.safeParse(
      form({ status: 'PUBLISHED', redactionConfirmed: 'on' }),
    )

    expect(result.success).toBe(true)
  })

  it('menolak isi yang bukan JSON', () => {
    const result = knowledgeDocumentSchema.safeParse(
      form({ contentIdJson: '{bukan json' }),
    )

    expect(result.success).toBe(false)
    expect(fieldError(result)).toContain('contentIdJson')
  })

  it('menolak JSON sah yang bukan dokumen ProseMirror', () => {
    const result = knowledgeDocumentSchema.safeParse(
      form({ contentIdJson: JSON.stringify({ type: 'paragraph' }) }),
    )

    expect(result.success).toBe(false)
  })

  it('menolak isi kosong', () => {
    const result = knowledgeDocumentSchema.safeParse(
      form({ contentIdJson: '' }),
    )

    expect(result.success).toBe(false)
    expect(fieldError(result)).toContain('contentIdJson')
  })

  it('membolehkan isi EN kosong', () => {
    const result = knowledgeDocumentSchema.safeParse(
      form({ contentEnJson: '' }),
    )

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.contentEnJson).toBeNull()
  })

  /**
   * Editor yang dibiarkan kosong TIDAK mengirim string kosong — ProseMirror
   * selalu menyisakan satu paragraf. Kalau itu tersimpan apa adanya,
   * halaman /en menampilkan badan kosong, bukan versi Indonesia.
   */
  it('menganggap dokumen berisi paragraf kosong sebagai tidak ada isi', () => {
    const result = knowledgeDocumentSchema.safeParse(
      form({
        contentEnJson: JSON.stringify({
          type: 'doc',
          content: [{ type: 'paragraph' }, { type: 'paragraph' }],
        }),
      }),
    )

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.contentEnJson).toBeNull()
  })

  it('menolak isi ID yang hanya berisi paragraf kosong', () => {
    const result = knowledgeDocumentSchema.safeParse(
      form({
        contentIdJson: JSON.stringify({
          type: 'doc',
          content: [{ type: 'paragraph' }],
        }),
      }),
    )

    expect(result.success).toBe(false)
    expect(fieldError(result)).toContain('contentIdJson')
  })

  it('menghitung gambar dan tabel sebagai isi meski tanpa teks', () => {
    const result = knowledgeDocumentSchema.safeParse(
      form({
        contentEnJson: JSON.stringify({
          type: 'doc',
          content: [
            { type: 'paragraph' },
            { type: 'image', attrs: { src: '/bukti.png' } },
          ],
        }),
      }),
    )

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.contentEnJson).not.toBeNull()
  })

  it('memecah tag per koma, memangkas spasi, dan membuang duplikat', () => {
    const result = knowledgeDocumentSchema.safeParse(
      form({ tags: ' jaringan , vlan,  jaringan ,, mikrotik ' }),
    )

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tags).toEqual(['jaringan', 'vlan', 'mikrotik'])
    }
  })

  it('mengubah tingkat kosong menjadi null, bukan string kosong', () => {
    const result = knowledgeDocumentSchema.safeParse(form({ difficulty: '' }))

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.difficulty).toBeNull()
  })

  it('menolak slug dengan huruf besar atau spasi', () => {
    expect(
      knowledgeDocumentSchema.safeParse(form({ slug: 'SOP Uji' })).success,
    ).toBe(false)
  })

  it('menolak tipe dokumen di luar empat yang dikenal', () => {
    expect(
      knowledgeDocumentSchema.safeParse(form({ type: 'CATATAN' })).success,
    ).toBe(false)
  })
})
