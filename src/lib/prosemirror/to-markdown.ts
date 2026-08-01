import { safeLink } from './safe-url'
import type { ProseMirrorDocument, ProseMirrorNode } from './types'

/**
 * ProseMirror → Markdown, untuk ekspor.
 *
 * Node yang dikenal di sini adalah node yang sama dengan `render.tsx`.
 * Node asing diperlakukan sama pula: isinya tetap dikeluarkan sebagai teks,
 * bukan dibuang. Ekspor yang diam-diam menghilangkan satu blok jauh lebih
 * berbahaya daripada ekspor yang blok asingnya kehilangan format — yang
 * pertama tidak akan pernah disadari.
 *
 * Ini BUKAN jalur render halaman publik dan tidak pernah dipakai untuk itu.
 */

function escapeText(text: string): string {
  // Karakter yang mengubah arti baris di Markdown. Tanda kutip dan kurung
  // sengaja dibiarkan — meng-escape semuanya membuat hasilnya sulit dibaca
  // manusia, padahal itu justru gunanya ekspor Markdown.
  return text.replace(/([\\`*_[\]#])/g, '\\$1')
}

function inline(nodes: ProseMirrorNode[] | undefined): string {
  if (!nodes) return ''

  return nodes.map(inlineNode).join('')
}

function inlineNode(node: ProseMirrorNode): string {
  if (node.type === 'hardBreak') return '  \n'

  if (node.type === 'text') {
    let text = escapeText(node.text ?? '')

    for (const mark of node.marks ?? []) {
      if (mark.type === 'code') text = `\`${node.text ?? ''}\``
      else if (mark.type === 'bold' || mark.type === 'strong') text = `**${text}**`
      else if (mark.type === 'italic' || mark.type === 'em') text = `*${text}*`
      else if (mark.type === 'strike') text = `~~${text}~~`
      else if (mark.type === 'link') {
        const link = safeLink(mark.attrs?.href)

        // Tautan yang skemanya tidak lolos daftar-izin kehilangan href-nya,
        // teksnya tetap ada — sama seperti di renderer publik.
        text = link ? `[${text}](${link.href})` : text
      }
    }

    return text
  }

  if (node.type === 'image') {
    const src = typeof node.attrs?.src === 'string' ? node.attrs.src : ''
    const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : ''

    return src ? `![${alt}](${src})` : alt
  }

  return inline(node.content)
}

function listItems(
  node: ProseMirrorNode,
  marker: (index: number) => string,
): string {
  return (node.content ?? [])
    .map((item, index) => {
      const prefix = marker(index)
      const body = blocks(item.content ?? []).trimEnd()

      // Baris lanjutan diberi indentasi selebar penanda daftar, kalau tidak
      // paragraf kedua sebuah butir menjadi butir baru.
      const indented = body
        .split('\n')
        .map((line, lineIndex) =>
          lineIndex === 0 ? line : line ? `${' '.repeat(prefix.length)}${line}` : '',
        )
        .join('\n')

      return `${prefix}${indented}`
    })
    .join('\n')
}

function tableRow(row: ProseMirrorNode): string {
  const cells = (row.content ?? []).map((cell) =>
    blocks(cell.content ?? [])
      .replace(/\n+/g, ' ')
      // Pipa di dalam sel akan memecah kolom.
      .replace(/\|/g, '\\|')
      .trim(),
  )

  return `| ${cells.join(' | ')} |`
}

function block(node: ProseMirrorNode): string {
  switch (node.type) {
    case 'paragraph':
      return inline(node.content)

    case 'heading': {
      const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 2
      const clamped = Math.min(Math.max(level, 1), 6)

      return `${'#'.repeat(clamped)} ${inline(node.content)}`
    }

    case 'bulletList':
      return listItems(node, () => '- ')

    case 'orderedList':
      return listItems(node, (index) => `${index + 1}. `)

    case 'taskList':
      return (node.content ?? [])
        .map((item) => {
          const checked = item.attrs?.checked === true

          return `- [${checked ? 'x' : ' '}] ${blocks(item.content ?? []).trim()}`
        })
        .join('\n')

    case 'blockquote':
      return blocks(node.content ?? [])
        .trimEnd()
        .split('\n')
        .map((line) => (line ? `> ${line}` : '>'))
        .join('\n')

    case 'codeBlock': {
      const language =
        typeof node.attrs?.language === 'string' ? node.attrs.language : ''
      const body = (node.content ?? []).map((child) => child.text ?? '').join('')

      return `\`\`\`${language}\n${body}\n\`\`\``
    }

    case 'horizontalRule':
      return '---'

    case 'image':
      return inlineNode(node)

    case 'table': {
      const rows = node.content ?? []

      if (rows.length === 0) return ''

      const [head, ...rest] = rows
      const columnCount = head?.content?.length ?? 0
      const divider = `| ${Array(columnCount).fill('---').join(' | ')} |`

      return [
        head ? tableRow(head) : '',
        divider,
        ...rest.map(tableRow),
      ]
        .filter(Boolean)
        .join('\n')
    }

    default:
      // Node asing: isinya tetap keluar, tanpa format.
      return blocks(node.content ?? [])
  }
}

function blocks(nodes: ProseMirrorNode[]): string {
  return nodes
    .map(block)
    .filter((text) => text.trim() !== '')
    .join('\n\n')
}

export function documentToMarkdown(doc: ProseMirrorDocument): string {
  return blocks(doc.content ?? []).trimEnd() + '\n'
}
