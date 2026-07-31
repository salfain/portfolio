import { describe, expect, it } from 'vitest'

import {
  assignHeadingIds,
  collectHeadings,
  documentText,
  slugifyHeading,
} from '@/lib/prosemirror/headings'
import { safeImageSrc, safeLink } from '@/lib/prosemirror/safe-url'
import { parseDocument } from '@/lib/prosemirror/types'

/**
 * Parse dokumen uji dan pastikan hasilnya bukan null.
 *
 * Menghindari `!` di seluruh berkas tes — non-null assertion dilarang
 * lint, dan di tes ia menyembunyikan kegagalan parse sebagai galat
 * "cannot read property of null" yang membingungkan.
 */
function doc(value: unknown) {
  const parsed = parseDocument(value)

  if (!parsed) throw new Error('Dokumen uji tidak valid')

  return parsed
}

function heading(level: number, text: string) {
  return {
    type: 'heading',
    attrs: { level },
    content: [{ type: 'text', text }],
  }
}

describe('slugifyHeading', () => {
  it('membuat slug dari judul biasa', () => {
    expect(slugifyHeading('Langkah Konfigurasi')).toBe('langkah-konfigurasi')
  })

  it('membuang tanda baca', () => {
    expect(slugifyHeading('Validasi: apakah berhasil?')).toBe(
      'validasi-apakah-berhasil',
    )
  })

  it('merapatkan spasi berlebih', () => {
    expect(slugifyHeading('Rencana   IP  &  VLAN')).toBe('rencana-ip-vlan')
  })

  it('judul tanpa karakter latin menghasilkan slug kosong', () => {
    // Pemanggil yang memberi nomor urut sebagai gantinya.
    expect(slugifyHeading('。、')).toBe('')
  })
})

describe('assignHeadingIds', () => {
  it('membuat id unik untuk judul yang sama persis', () => {
    const ids = assignHeadingIds(
      doc({
        type: 'doc',
        content: [
          heading(2, 'Validasi'),
          heading(2, 'Validasi'),
          heading(2, 'Validasi'),
        ],
      }),
    ).map((item) => item.id)

    expect(ids).toEqual(['validasi', 'validasi-2', 'validasi-3'])
    expect(new Set(ids).size).toBe(3)
  })

  it('memberi nomor urut saat slug kosong', () => {
    const parsed = doc({ type: 'doc', content: [heading(2, '???')] })

    expect(assignHeadingIds(parsed)[0]?.id).toBe('bagian-1')
  })
})

describe('collectHeadings', () => {
  it('hanya mengambil level yang diminta', () => {
    const parsed = doc({
      type: 'doc',
      content: [
        heading(1, 'Judul'),
        heading(2, 'Dua'),
        heading(3, 'Tiga'),
        heading(4, 'Empat'),
      ],
    })

    expect(collectHeadings(parsed).map((h) => h.text)).toEqual(['Dua', 'Tiga'])
  })

  it('id-nya cocok dengan assignHeadingIds', () => {
    // Kalau keduanya berbeda, tautan daftar isi menunjuk anchor yang
    // tidak ada — persis bug yang paling sulit terlihat di halaman panjang.
    const parsed = doc({
      type: 'doc',
      content: [heading(2, 'Sama'), heading(3, 'Sama')],
    })

    const all = assignHeadingIds(parsed)
    const toc = collectHeadings(parsed)

    expect(toc.map((h) => h.id)).toEqual(all.map((h) => h.id))
  })
})

describe('documentText', () => {
  it('menggabungkan teks dari node bersarang', () => {
    const parsed = doc({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Periksa ' },
            { type: 'text', text: 'kabel', marks: [{ type: 'bold' }] },
          ],
        },
      ],
    })

    expect(documentText(parsed)).toBe('Periksa kabel')
  })
})

describe('parseDocument', () => {
  it('menerima dokumen kosong', () => {
    expect(parseDocument({ type: 'doc' })).toEqual({ type: 'doc' })
  })

  it('menolak nilai yang bukan dokumen', () => {
    expect(parseDocument(null)).toBeNull()
    expect(parseDocument({ type: 'paragraph' })).toBeNull()
    expect(parseDocument('teks biasa')).toBeNull()
  })

  it('membiarkan node tak dikenal lolos', () => {
    // Dokumen dari editor versi lebih baru tidak boleh menjatuhkan halaman.
    const parsed = parseDocument({
      type: 'doc',
      content: [{ type: 'blokMasaDepan', attrs: { apa: 'saja' } }],
    })

    expect(parsed?.content?.[0]?.type).toBe('blokMasaDepan')
  })
})

describe('safeLink', () => {
  it.each(['http://contoh.id', 'https://contoh.id/a', 'mailto:a@b.id'])(
    'mengizinkan %s',
    (href) => {
      expect(safeLink(href)).not.toBeNull()
    },
  )

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'data:text/html,<script>',
    'vbscript:msgbox',
    'file:///etc/passwd',
  ])('menolak %s', (href) => {
    expect(safeLink(href)).toBeNull()
  })

  it('mengizinkan tautan relatif dan anchor', () => {
    expect(safeLink('/knowledge/sop')).toEqual({
      href: '/knowledge/sop',
      isExternal: false,
    })
    expect(safeLink('#validasi')?.isExternal).toBe(false)
  })

  it('menandai tautan http sebagai eksternal, mailto tidak', () => {
    expect(safeLink('https://contoh.id')?.isExternal).toBe(true)
    expect(safeLink('mailto:a@b.id')?.isExternal).toBe(false)
  })

  it('menolak nilai kosong dan bukan string', () => {
    expect(safeLink('')).toBeNull()
    expect(safeLink('   ')).toBeNull()
    expect(safeLink(undefined)).toBeNull()
    expect(safeLink(42)).toBeNull()
  })
})

describe('safeImageSrc', () => {
  it('mengizinkan path relatif', () => {
    expect(safeImageSrc('/bukti/topologi.png')).toBe('/bukti/topologi.png')
  })

  it('menolak URL remote sampai penyimpanan objek dipasang', () => {
    expect(safeImageSrc('https://contoh.id/a.png')).toBeNull()
  })

  it('menolak URL protokol-relatif', () => {
    // "//evil.test/x.png" akan dimuat lewat http(s) dari host lain.
    expect(safeImageSrc('//evil.test/a.png')).toBeNull()
  })
})
