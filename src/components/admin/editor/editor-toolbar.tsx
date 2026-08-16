'use client'

import type { Editor } from '@tiptap/react'

import { cn } from '@/lib/cn'

/**
 * Bilah alat editor.
 *
 * Setiap tombol memakai `aria-pressed` supaya pembaca layar tahu format
 * mana yang sedang aktif — warna latar saja tidak terdengar.
 *
 * Tombol tautan meminta URL lewat `window.prompt`. Itu memang kasar, tapi
 * antarmuka admin dipakai satu orang, dan dialog kustom untuk ini adalah
 * pekerjaan yang tidak sebanding hasilnya. Skema tetap dibatasi oleh
 * konfigurasi ekstensi Link.
 */
type ButtonSpec = {
  label: string
  title: string
  isActive?: (editor: Editor) => boolean
  run: (editor: Editor) => void
}

const GROUPS: ButtonSpec[][] = [
  [
    {
      label: 'H2',
      title: 'Judul bagian',
      isActive: (e) => e.isActive('heading', { level: 2 }),
      run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: 'H3',
      title: 'Sub-judul',
      isActive: (e) => e.isActive('heading', { level: 3 }),
      run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    },
  ],
  [
    {
      label: 'B',
      title: 'Tebal',
      isActive: (e) => e.isActive('bold'),
      run: (e) => e.chain().focus().toggleBold().run(),
    },
    {
      label: 'I',
      title: 'Miring',
      isActive: (e) => e.isActive('italic'),
      run: (e) => e.chain().focus().toggleItalic().run(),
    },
    {
      label: '</>',
      title: 'Kode sebaris',
      isActive: (e) => e.isActive('code'),
      run: (e) => e.chain().focus().toggleCode().run(),
    },
  ],
  [
    {
      label: '• Daftar',
      title: 'Daftar berbutir',
      isActive: (e) => e.isActive('bulletList'),
      run: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
      label: '1. Langkah',
      title: 'Langkah bernomor',
      isActive: (e) => e.isActive('orderedList'),
      run: (e) => e.chain().focus().toggleOrderedList().run(),
    },
  ],
  [
    {
      label: 'Perintah',
      title: 'Blok perintah',
      isActive: (e) => e.isActive('codeBlock'),
      run: (e) => e.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: 'Kutipan',
      title: 'Kutipan',
      isActive: (e) => e.isActive('blockquote'),
      run: (e) => e.chain().focus().toggleBlockquote().run(),
    },
    {
      label: 'Tabel',
      title: 'Sisipkan tabel 3×3 dengan baris judul',
      run: (e) =>
        e
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      label: '—',
      title: 'Garis pemisah',
      run: (e) => e.chain().focus().setHorizontalRule().run(),
    },
  ],
  [
    {
      label: 'Tautan',
      title: 'Tambah atau ubah tautan',
      isActive: (e) => e.isActive('link'),
      run: (e) => {
        const previous = e.getAttributes('link').href as string | undefined
        const input = window.prompt(
          'URL (http, https, atau mailto):',
          previous ?? '',
        )

        // Batal: biarkan apa adanya. Dikosongkan: buang tautannya.
        if (input === null) return

        if (input.trim() === '') {
          e.chain().focus().extendMarkRange('link').unsetLink().run()
          return
        }

        e.chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: input.trim() })
          .run()
      },
    },
  ],
]

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  return (
    <div
      role="toolbar"
      aria-label="Format teks"
      className="flex flex-wrap items-center gap-1 border-b border-border bg-elevated px-3 py-2"
    >
      {GROUPS.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-1">
          {groupIndex > 0 ? (
            <span aria-hidden className="mx-1 h-5 w-px bg-border" />
          ) : null}

          {group.map((button) => {
            const active = button.isActive?.(editor) ?? false

            return (
              <button
                key={button.label}
                type="button"
                title={button.title}
                aria-label={button.title}
                aria-pressed={button.isActive ? active : undefined}
                onClick={() => button.run(editor)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-sm transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted hover:bg-surface hover:text-foreground',
                )}
              >
                {button.label}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
