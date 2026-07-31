import type { ProseMirrorDocument, ProseMirrorNode } from './types'

export type Heading = {
  id: string
  text: string
  level: number
}

/** Teks polos dari satu node beserta seluruh keturunannya. */
export function nodeText(node: ProseMirrorNode): string {
  if (typeof node.text === 'string') return node.text

  if (!node.content) return ''

  return node.content.map(nodeText).join('')
}

/** Seluruh teks polos dokumen — dipakai untuk ringkasan dan indeks. */
export function documentText(doc: ProseMirrorDocument): string {
  return (doc.content ?? [])
    .map(nodeText)
    .filter(Boolean)
    .join('\n')
}

/**
 * Slug anchor dari teks judul.
 *
 * Huruf non-latin dibuang, bukan di-transliterasi: hasil transliterasi
 * otomatis untuk bahasa Indonesia jarang salah, tapi untuk istilah teknis
 * campuran hasilnya tidak bisa ditebak. Kalau slug jadi kosong, pemanggil
 * memberi nomor urut sebagai gantinya.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Kumpulkan heading untuk daftar isi.
 *
 * `id` dijamin unik di dalam satu dokumen: judul yang sama persis muncul
 * dua kali akan menghasilkan dua anchor identik, dan tautan daftar isi
 * kedua tidak akan pernah bisa dituju.
 *
 * Fungsi ini HARUS menghasilkan id yang sama persis dengan `render.tsx`,
 * kalau tidak daftar isinya menunjuk anchor yang tidak ada. Keduanya
 * memakai `assignHeadingIds` supaya tidak bisa berbeda.
 */
export function collectHeadings(
  doc: ProseMirrorDocument,
  levels: number[] = [2, 3],
): Heading[] {
  return assignHeadingIds(doc).filter((heading) =>
    levels.includes(heading.level),
  )
}

/** Seluruh heading dokumen, sudah ber-id unik, terurut sesuai dokumen. */
export function assignHeadingIds(doc: ProseMirrorDocument): Heading[] {
  const used = new Map<string, number>()
  const headings: Heading[] = []

  const walk = (nodes: ProseMirrorNode[]) => {
    for (const node of nodes) {
      if (node.type === 'heading') {
        const text = nodeText(node)
        const base = slugifyHeading(text) || `bagian-${headings.length + 1}`
        const seen = used.get(base) ?? 0

        used.set(base, seen + 1)

        headings.push({
          id: seen === 0 ? base : `${base}-${seen + 1}`,
          text,
          level: typeof node.attrs?.level === 'number' ? node.attrs.level : 1,
        })
      }

      if (node.content) walk(node.content)
    }
  }

  walk(doc.content ?? [])

  return headings
}
