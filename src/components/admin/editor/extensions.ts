import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from '@tiptap/extension-table'
import StarterKit from '@tiptap/starter-kit'

/**
 * Ekstensi editor — dipilih agar cocok PERSIS dengan node yang dikenal
 * renderer publik (`src/lib/prosemirror/render.tsx`).
 *
 * Menambah ekstensi di sini tanpa menambah `case` di renderer berarti
 * penulis melihat blok di editor yang tidak pernah muncul di situs.
 * Renderer memang mengabaikan node asing tanpa error, tapi diam-diam
 * menghilangkan isi adalah kegagalan yang paling lama tidak ketahuan.
 */
export function editorExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      // Link diatur terpisah di bawah supaya kebijakan `rel`/`target`
      // dan daftar-izin skema URL-nya eksplisit.
      link: false,
      // Renderer tidak mengenal blok kutipan bersarang maupun gambar
      // sebaris; sisanya dari StarterKit sudah dikenal semua.
      codeBlock: { HTMLAttributes: { class: 'font-mono' } },
    }),

    Link.configure({
      openOnClick: false,
      autolink: false,
      // Daftar-izin skema. `javascript:` dan `data:` ditolak di sini DAN
      // sekali lagi saat render (`safe-url.ts`) — penulis bisa saja
      // menempel JSON dokumen hasil editor lain.
      protocols: ['http', 'https', 'mailto'],
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    }),

    Image.configure({ inline: false, allowBase64: false }),

    TaskList,
    TaskItem.configure({ nested: false }),

    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,

    Placeholder.configure({ placeholder }),
  ]
}
