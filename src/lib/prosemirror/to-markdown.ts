import type { ProseMirrorDocument, ProseMirrorNode } from './types'

/**
 * Dokumen ProseMirror → Markdown.
 *
 * Dipakai HANYA untuk ekspor. Halaman publik dirender langsung dari JSON
 * (`render.tsx`), tidak pernah lewat Markdown — konversi bolak-balik selalu
 * kehilangan sesuatu, dan yang hilang di sini tidak berdampak karena
 * hasilnya untuk dibaca manusia, bukan dirender ulang.
 *
 * Node yang tidak dikenal dituliskan teksnya saja, sama seperti perilaku
 * renderer: lebih baik kehilangan formatnya daripada kehilangan isinya.
 */

function escapeInline(text: string): string {
  // Hanya karakter yang benar-benar mengubah arti di Markdown. Meng-escape
  // semuanya membuat perintah CLI di teks jadi sulit dibaca.
  return text.replace(/([\\`*_[\]])/g, '\\$1')
}

function inline(node: ProseMirrorNode): string {
  if (typeof node.text === 'string') {
    let text = escapeInline(node.text)

    for (const mark of node.marks ?? []) {
      switch (mark.type) {
        case 'bold':
        case 'strong':
          text = `**${text}**`
          break
        case 'italic':
        case 'em':
          text = `_${text}_`
          break
        case 'strike':
          text = `~~${text}~~`
          break
        case 'code':
          // Kode sebaris tidak boleh ikut di-escape.
          text = `\`${node.text}\``
          break
        case 'link': {
          const href = mark.attrs?.href

          if (typeof href === 'string') text = `[${text}](${href})`
          break
        }
        default:
          break
      }
    }

    return text
  }

  if (node.type === 'hardBreak') return '  \n'

  return (node.content ?? []).map(inline).join('')
}

function plain(node: ProseMirrorNode): string {
  if (typeof node.text === 'string') return node.text

  return (node.content ?? []).map(plain).join('')
}

function block(node: ProseMirrorNode, depth = 0): string {
  const indent = '  '.repeat(depth)

  switch (node.type) {
    case 'paragraph':
      return `${indent}${(node.content ?? []).map(inline).join('')}`

    case 'heading': {
      const level =
        typeof node.attrs?.level === 'number' ? node.attrs.level : 1

      return `${'#'.repeat(Math.min(level, 6))} ${(node.content ?? []).map(inline).join('')}`
    }

    case 'bulletList':
      return (node.content ?? [])
        .map((item) => `${indent}- ${blocks(item.content ?? [], depth + 1).trim()}`)
        .join('\n')

    case 'orderedList': {
      const start = typeof node.attrs?.start === 'number' ? node.attrs.start : 1

      return (node.content ?? [])
        .map(
          (item, index) =>
            `${indent}${start + index}. ${blocks(item.content ?? [], depth + 1).trim()}`,
        )
        .join('\n')
    }

    case 'taskList':
      return (node.content ?? [])
        .map(
          (item) =>
            `${indent}- [${item.attrs?.checked === true ? 'x' : ' '}] ${blocks(item.content ?? [], depth + 1).trim()}`,
        )
        .join('\n')

    case 'blockquote':
      return blocks(node.content ?? [], depth)
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')

    case 'codeBlock': {
      const language =
        typeof node.attrs?.language === 'string' ? node.attrs.language : ''

      return `\`\`\`${language}\n${plain(node)}\n\`\`\``
    }

    case 'horizontalRule':
      return '---'

    case 'image': {
      const src = typeof node.attrs?.src === 'string' ? node.attrs.src : ''
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : ''

      return `![${alt}](${src})`
    }

    case 'table': {
      const rows = node.content ?? []

      if (rows.length === 0) return ''

      const toCells = (row: ProseMirrorNode) =>
        (row.content ?? []).map((cell) =>
          (cell.content ?? []).map(inline).join('').replace(/\|/g, '\\|'),
        )

      const [head, ...body] = rows
      const headCells = head ? toCells(head) : []

      return [
        `| ${headCells.join(' | ')} |`,
        `| ${headCells.map(() => '---').join(' | ')} |`,
        ...body.map((row) => `| ${toCells(row).join(' | ')} |`),
      ].join('\n')
    }

    default:
      return node.content ? blocks(node.content, depth) : ''
  }
}

function blocks(nodes: ProseMirrorNode[], depth = 0): string {
  return nodes
    .map((node) => block(node, depth))
    .filter((text) => text.trim() !== '')
    .join('\n\n')
}

export function documentToMarkdown(doc: ProseMirrorDocument): string {
  return blocks(doc.content ?? [])
}
