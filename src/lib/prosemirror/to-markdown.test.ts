import { describe, expect, it } from 'vitest'

import { documentToMarkdown } from '@/lib/prosemirror/to-markdown'
import { parseDocument } from '@/lib/prosemirror/types'

function doc(content: unknown[]) {
  const parsed = parseDocument({ type: 'doc', content })

  if (!parsed) throw new Error('Dokumen uji tidak valid')

  return parsed
}

const text = (value: string) => ({ type: 'text', text: value })

describe('documentToMarkdown', () => {
  it('judul memakai jumlah pagar sesuai level', () => {
    expect(
      documentToMarkdown(
        doc([{ type: 'heading', attrs: { level: 2 }, content: [text('Tujuan')] }]),
      ),
    ).toBe('## Tujuan')
  })

  it('menggabungkan mark tebal dan miring', () => {
    const result = documentToMarkdown(
      doc([
        {
          type: 'paragraph',
          content: [
            { ...text('tebal'), marks: [{ type: 'bold' }] },
            text(' dan '),
            { ...text('miring'), marks: [{ type: 'italic' }] },
          ],
        },
      ]),
    )

    expect(result).toBe('**tebal** dan _miring_')
  })

  it('kode sebaris tidak ikut di-escape', () => {
    // Kalau di-escape, `ip_addr` jadi `ip\_addr` dan perintahnya salah.
    const result = documentToMarkdown(
      doc([
        {
          type: 'paragraph',
          content: [{ ...text('ip_addr *x*'), marks: [{ type: 'code' }] }],
        },
      ]),
    )

    expect(result).toBe('`ip_addr *x*`')
  })

  it('meng-escape karakter Markdown di teks biasa', () => {
    expect(
      documentToMarkdown(doc([{ type: 'paragraph', content: [text('a*b_c')] }])),
    ).toBe('a\\*b\\_c')
  })

  it('tautan menjadi sintaks Markdown', () => {
    const result = documentToMarkdown(
      doc([
        {
          type: 'paragraph',
          content: [
            {
              ...text('contoh'),
              marks: [{ type: 'link', attrs: { href: 'https://a.test' } }],
            },
          ],
        },
      ]),
    )

    expect(result).toBe('[contoh](https://a.test)')
  })

  it('blok perintah mempertahankan isi apa adanya', () => {
    const result = documentToMarkdown(
      doc([
        {
          type: 'codeBlock',
          attrs: { language: 'bash' },
          content: [text('ping -c 4 8.8.8.8')],
        },
      ]),
    )

    expect(result).toBe('```bash\nping -c 4 8.8.8.8\n```')
  })

  it('daftar berbutir dan bernomor', () => {
    expect(
      documentToMarkdown(
        doc([
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [text('satu')] }],
              },
            ],
          },
        ]),
      ),
    ).toBe('- satu')

    expect(
      documentToMarkdown(
        doc([
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [text('pertama')] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [text('kedua')] }],
              },
            ],
          },
        ]),
      ),
    ).toBe('1. pertama\n2. kedua')
  })

  it('tabel mendapat baris pemisah', () => {
    const cell = (value: string, type: string) => ({
      type,
      content: [{ type: 'paragraph', content: [text(value)] }],
    })

    const result = documentToMarkdown(
      doc([
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [cell('VLAN', 'tableHeader'), cell('Subnet', 'tableHeader')],
            },
            {
              type: 'tableRow',
              content: [cell('10', 'tableCell'), cell('192.0.2.0/24', 'tableCell')],
            },
          ],
        },
      ]),
    )

    expect(result).toBe(
      '| VLAN | Subnet |\n| --- | --- |\n| 10 | 192.0.2.0/24 |',
    )
  })

  it('node tak dikenal tetap menyumbang isinya', () => {
    const result = documentToMarkdown(
      doc([
        {
          type: 'blokMasaDepan',
          content: [{ type: 'paragraph', content: [text('tetap ada')] }],
        },
      ]),
    )

    expect(result).toBe('tetap ada')
  })
})
