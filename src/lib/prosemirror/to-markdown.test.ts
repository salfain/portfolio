import { describe, expect, it } from 'vitest'

import { documentToMarkdown } from './to-markdown'
import type { ProseMirrorDocument } from './types'

const doc = (content: ProseMirrorDocument['content']): ProseMirrorDocument => ({
  type: 'doc',
  content,
})

const text = (value: string) => ({ type: 'text', text: value })

describe('documentToMarkdown', () => {
  it('mengubah heading sesuai tingkatnya', () => {
    const result = documentToMarkdown(
      doc([
        { type: 'heading', attrs: { level: 2 }, content: [text('Tujuan')] },
        { type: 'heading', attrs: { level: 3 }, content: [text('Prasyarat')] },
      ]),
    )

    expect(result).toContain('## Tujuan')
    expect(result).toContain('### Prasyarat')
  })

  it('menerapkan mark tebal, miring, dan kode', () => {
    const result = documentToMarkdown(
      doc([
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'tebal', marks: [{ type: 'bold' }] },
            text(' '),
            { type: 'text', text: 'miring', marks: [{ type: 'italic' }] },
            text(' '),
            { type: 'text', text: 'kode', marks: [{ type: 'code' }] },
          ],
        },
      ]),
    )

    expect(result).toContain('**tebal**')
    expect(result).toContain('*miring*')
    expect(result).toContain('`kode`')
  })

  /**
   * Aturan yang sama dengan renderer publik: tautan yang skemanya tidak lolos
   * daftar-izin kehilangan href-nya, teksnya tetap ada. Berkas ekspor bisa
   * dibuka di penampil Markdown mana pun, termasuk yang mengeksekusi tautan.
   */
  it('membuang href berskema javascript, teksnya tetap keluar', () => {
    const result = documentToMarkdown(
      doc([
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'klik',
              marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
            },
          ],
        },
      ]),
    )

    expect(result).toContain('klik')
    expect(result).not.toContain('javascript:')
    expect(result).not.toContain('](')
  })

  it('mempertahankan tautan https', () => {
    const result = documentToMarkdown(
      doc([
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'rujukan',
              marks: [
                { type: 'link', attrs: { href: 'https://contoh.test/a' } },
              ],
            },
          ],
        },
      ]),
    )

    expect(result).toContain('[rujukan](https://contoh.test/a)')
  })

  it('mengubah daftar berpoin dan bernomor', () => {
    const item = (value: string) => ({
      type: 'listItem',
      content: [{ type: 'paragraph', content: [text(value)] }],
    })

    expect(
      documentToMarkdown(doc([{ type: 'bulletList', content: [item('satu')] }])),
    ).toContain('- satu')

    expect(
      documentToMarkdown(
        doc([{ type: 'orderedList', content: [item('satu'), item('dua')] }]),
      ),
    ).toContain('2. dua')
  })

  it('mengubah blok perintah beserta bahasanya', () => {
    const result = documentToMarkdown(
      doc([
        {
          type: 'codeBlock',
          attrs: { language: 'bash' },
          content: [text('ping 10.0.0.1')],
        },
      ]),
    )

    expect(result).toContain('```bash')
    expect(result).toContain('ping 10.0.0.1')
  })

  it('mengubah tabel lengkap dengan baris pemisah', () => {
    const cell = (value: string) => ({
      type: 'tableCell',
      content: [{ type: 'paragraph', content: [text(value)] }],
    })

    const result = documentToMarkdown(
      doc([
        {
          type: 'table',
          content: [
            { type: 'tableRow', content: [cell('A'), cell('B')] },
            { type: 'tableRow', content: [cell('1'), cell('2')] },
          ],
        },
      ]),
    )

    expect(result).toContain('| A | B |')
    expect(result).toContain('| --- | --- |')
    expect(result).toContain('| 1 | 2 |')
  })

  /**
   * Sama seperti renderer: node yang tidak dikenal tidak boleh menghilangkan
   * isinya. Ekspor yang diam-diam kehilangan satu blok tidak akan pernah
   * disadari.
   */
  it('tetap mengeluarkan isi node yang tidak dikenal', () => {
    const result = documentToMarkdown(
      doc([
        {
          type: 'blokMasaDepan',
          content: [{ type: 'paragraph', content: [text('isi penting')] }],
        },
      ]),
    )

    expect(result).toContain('isi penting')
  })

  it('meng-escape karakter Markdown di teks biasa', () => {
    const result = documentToMarkdown(
      doc([{ type: 'paragraph', content: [text('harga * 2 dan _garis_')] }]),
    )

    expect(result).toContain('\\*')
    expect(result).toContain('\\_')
  })

  it('dokumen kosong menghasilkan berkas kosong, bukan melempar', () => {
    expect(documentToMarkdown(doc([]))).toBe('\n')
  })
})
