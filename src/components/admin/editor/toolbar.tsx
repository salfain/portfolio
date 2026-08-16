'use client'

import type { Editor } from '@tiptap/react'

import { cn } from '@/lib/cn'

type ToolbarButton = {
  label: string
  title: string
  run: (editor: Editor) => void
  active?: (editor: Editor) => boolean
}

/**
 * Tombol ditulis sebagai teks, bukan ikon.
 *
 * Antarmuka admin dipakai satu orang dan tidak perlu ikon set baru; label
 * teks juga langsung terbaca screen reader tanpa `aria-label` tambahan
 * yang gampang lupa diperbarui (docs/rules/05_ACCESSIBILITY.md).
 */
const GROUPS: ToolbarButton[][] = [
  [
    {
      label: 'H2',
      title: 'Judul bagian',
      run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: (editor) => editor.isActive('heading', { level: 2 }),
    },
    {
      label: 'H3',
      title: 'Sub-judul',
      run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: (editor) => editor.isActive('heading', { level: 3 }),
    },
  ],
  [
    {
      label: 'B',
      title: 'Tebal',
      run: (editor) => editor.chain().focus().toggleBold().run(),
      active: (editor) => editor.isActive('bold'),
    },
    {
      label: 'I',
      title: 'Miring',
      run: (editor) => editor.chain().focus().toggleItalic().run(),
      active: (editor) => editor.isActive('italic'),
    },
    {
      label: 'Kode',
      title: 'Kode sebaris',
      run: (editor) => editor.chain().focus().toggleCode().run(),
      active: (editor) => editor.isActive('code'),
    },
  ],
  [
    {
      label: '• Daftar',
      title: 'Daftar berpoin',
      run: (editor) => editor.chain().focus().toggleBulletList().run(),
      active: (editor) => editor.isActive('bulletList'),
    },
    {
      label: '1. Daftar',
      title: 'Daftar bernomor',
      run: (editor) => editor.chain().focus().toggleOrderedList().run(),
      active: (editor) => editor.isActive('orderedList'),
    },
    {
      label: '☑ Ceklis',
      title: 'Daftar centang',
      run: (editor) => editor.chain().focus().toggleTaskList().run(),
      active: (editor) => editor.isActive('taskList'),
    },
  ],
  [
    {
      label: 'Kutipan',
      title: 'Blok kutipan',
      run: (editor) => editor.chain().focus().toggleBlockquote().run(),
      active: (editor) => editor.isActive('blockquote'),
    },
    {
      label: 'Blok perintah',
      title: 'Blok kode / keluaran terminal',
      run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
      active: (editor) => editor.isActive('codeBlock'),
    },
    {
      label: 'Tabel',
      title: 'Sisipkan tabel 3×3 dengan baris judul',
      run: (editor) =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      label: 'Garis',
      title: 'Garis pemisah',
      run: (editor) => editor.chain().focus().setHorizontalRule().run(),
    },
  ],
]

export function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div
      role="toolbar"
      aria-label="Format teks"
      className="flex flex-wrap items-center gap-1 border-b border-border p-2"
    >
      {GROUPS.map((group, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 ? (
            <span aria-hidden className="mx-1 h-5 w-px bg-border" />
          ) : null}

          {group.map((button) => (
            <ToolbarItem key={button.label} editor={editor} button={button} />
          ))}
        </div>
      ))}

      <div className="ml-auto flex items-center gap-1">
        <LinkButton editor={editor} />
        <button
          type="button"
          title="Hapus format"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          className={buttonClass(false)}
        >
          Bersihkan
        </button>
      </div>
    </div>
  )
}

function ToolbarItem({
  editor,
  button,
}: {
  editor: Editor
  button: ToolbarButton
}) {
  const active = button.active?.(editor) ?? false

  return (
    <button
      type="button"
      title={button.title}
      aria-pressed={button.active ? active : undefined}
      onClick={() => button.run(editor)}
      className={buttonClass(active)}
    >
      {button.label}
    </button>
  )
}

/**
 * Tautan diminta lewat `window.prompt`.
 *
 * Dialog kustom akan lebih rapi, tapi ini satu-satunya tempat editor butuh
 * masukan teks dan `prompt` sudah punya jebakan fokus serta dukungan
 * keyboard dari peramban. Nilainya tetap divalidasi: skema selain http,
 * https, dan mailto ditolak Tiptap, lalu ditolak sekali lagi saat render.
 */
function LinkButton({ editor }: { editor: Editor }) {
  const active = editor.isActive('link')

  return (
    <button
      type="button"
      title="Tautan"
      aria-pressed={active}
      onClick={() => {
        if (active) {
          editor.chain().focus().unsetLink().run()

          return
        }

        const href = window.prompt('Alamat tautan (http, https, atau mailto):')

        if (!href) return

        editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
      }}
      className={buttonClass(active)}
    >
      Tautan
    </button>
  )
}

function buttonClass(active: boolean) {
  return cn(
    'rounded-lg px-2.5 py-1.5 text-sm transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    active
      ? 'bg-primary text-primary-foreground'
      : 'text-muted hover:bg-elevated hover:text-foreground',
  )
}
