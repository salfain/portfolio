'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/cn'
import type { ProseMirrorDocument } from '@/lib/prosemirror/types'

import { EditorToolbar } from './editor-toolbar'

/**
 * Editor isi dokumen.
 *
 * Keluarannya JSON ProseMirror, disimpan ke `<input type="hidden">` supaya
 * ikut terkirim lewat server action yang sama dengan form lainnya — tidak
 * ada jalur simpan terpisah yang perlu diamankan sendiri.
 *
 * Ekstensi yang diaktifkan sengaja DIBATASI pada yang bisa dirender
 * `src/lib/prosemirror/render.tsx`. Mengaktifkan ekstensi yang tidak
 * dikenal renderer menghasilkan blok yang bisa disunting tapi hilang di
 * halaman publik — kegagalan yang tidak terlihat sampai dokumen terbit.
 */
export function RichTextEditor({
  name,
  initialContent,
  placeholder,
  onDocChange,
}: {
  name: string
  initialContent: ProseMirrorDocument | null
  placeholder: string
  /** Dipanggil tiap perubahan — dipakai autosave dan pemeriksaan blok wajib. */
  onDocChange?: (doc: ProseMirrorDocument) => void
}) {
  const [json, setJson] = useState(() =>
    JSON.stringify(initialContent ?? { type: 'doc', content: [] }),
  )

  const editor = useEditor({
    // Wajib false: Tiptap merender di klien, dan membiarkannya ikut SSR
    // menghasilkan hydration mismatch di seluruh area editor.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        // codeBlockLowlight tidak dipakai — halaman publik memang tidak
        // menyorot sintaks (lihat components/knowledge/code-block.tsx).
      }),
      Link.configure({
        openOnClick: false,
        autolink: false,
        // Daftar-izin yang sama dengan safeLink() di sisi render. Kalau
        // editor mengizinkan lebih banyak, tautannya akan hilang diam-diam
        // saat dirender — pengguna mengira tersimpan padahal tidak.
        protocols: ['http', 'https', 'mailto'],
      }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent ?? { type: 'doc', content: [] },
    editorProps: {
      attributes: {
        class: cn(
          'prose-editor min-h-[420px] px-5 py-4 focus:outline-none',
          'text-base leading-relaxed',
        ),
      },
    },
    onUpdate: ({ editor: instance }) => {
      const doc = instance.getJSON() as ProseMirrorDocument

      setJson(JSON.stringify(doc))
      onDocChange?.(doc)
    },
  })

  // Beri tahu pemanggil isi awalnya sekali, supaya pemeriksaan blok wajib
  // sudah benar sebelum pengguna mengetik apa pun.
  useEffect(() => {
    if (initialContent) onDocChange?.(initialContent)
    // Sengaja hanya sekali saat mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <EditorToolbar editor={editor} />

      <EditorContent editor={editor} />

      <input type="hidden" name={name} value={json} readOnly />
    </div>
  )
}
