'use client'

import { useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'

import { cn } from '@/lib/cn'
import { Label } from '@/components/ui'
import type { ProseMirrorDocument } from '@/lib/prosemirror/types'
import type { KnowledgeTypeValue } from '@/lib/schemas/admin'

import { editorExtensions } from './extensions'
import { templateFor } from './templates'
import { EditorToolbar } from './toolbar'
import { useAutosave } from './use-autosave'

const EMPTY: ProseMirrorDocument = { type: 'doc', content: [] }

type Props = {
  /** Nama input tersembunyi yang ikut terkirim bersama form. */
  name: string
  label: string
  hint?: string
  error?: string
  defaultValue?: unknown
  /** Kunci penyimpanan pemulihan lokal — harus unik per dokumen per bahasa. */
  storageKey: string
  /** Tipe dokumen, dipakai tombol "Isi kerangka". */
  type: KnowledgeTypeValue
}

/**
 * Editor Tiptap untuk satu bahasa.
 *
 * Isinya dikirim ke server sebagai STRING JSON di `<input type="hidden">`,
 * lalu diparse dan divalidasi ulang di server (`knowledgeDocumentSchema`).
 * Tidak ada jalur lain: apa pun yang diketik di sini tetap dianggap masukan
 * yang belum dipercaya.
 *
 * Komponen ini hanya dimuat di rute admin lewat `next/dynamic` dengan
 * `ssr: false` — Tiptap tidak pernah ikut ke bundel halaman publik, yang
 * memakai renderer sendiri di `src/lib/prosemirror/render.tsx`.
 */
export function RichTextEditor({
  name,
  label,
  hint,
  error,
  defaultValue,
  storageKey,
  type,
}: Props) {
  const initial = asDocument(defaultValue) ?? EMPTY
  const [json, setJson] = useState(() => JSON.stringify(initial))
  const { recovered, save, dismiss } = useAutosave(storageKey)

  const editor = useEditor({
    extensions: editorExtensions('Tulis isi dokumen di sini…'),
    content: initial,
    // Wajib false: tanpa ini React menghidrasi HTML server yang berbeda
    // dari hasil render editor di klien.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose-admin min-h-[24rem] max-w-none px-4 py-3',
          'focus-visible:outline-none',
        ),
      },
    },
    onUpdate: ({ editor: instance }) => {
      const next = JSON.stringify(instance.getJSON())

      setJson(next)
      save(next)
    },
  })

  if (!editor) {
    return (
      <div className="rounded-2xl border border-border">
        <div className="h-[28rem] animate-pulse rounded-2xl bg-elevated" />
      </div>
    )
  }

  const isEmpty = editor.isEmpty

  return (
    <div>
      <Label htmlFor={`${name}-editor`} className="block">
        {label} <span aria-hidden>*</span>
      </Label>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}

      {recovered ? (
        <div
          role="status"
          className="mt-2 flex flex-wrap items-center gap-3 rounded-xl border border-warning bg-elevated px-4 py-3 text-sm"
        >
          <span>
            Ada naskah tersimpan di peramban ini dari{' '}
            {new Date(recovered.savedAt).toLocaleString('id-ID')}.
          </span>
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-primary-foreground"
            onClick={() => {
              const doc = asDocument(safeParse(recovered.json))

              if (doc) {
                editor.commands.setContent(doc)
                setJson(JSON.stringify(doc))
              }

              dismiss()
            }}
          >
            Pulihkan
          </button>
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-muted hover:text-foreground"
            onClick={dismiss}
          >
            Abaikan
          </button>
        </div>
      ) : null}

      <div
        className={cn(
          'mt-2 overflow-hidden rounded-2xl border bg-surface',
          error ? 'border-danger' : 'border-border',
        )}
      >
        <EditorToolbar editor={editor} />

        <div id={`${name}-editor`}>
          <EditorContent editor={editor} />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-2 text-xs text-muted">
          {isEmpty ? (
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-primary hover:bg-elevated"
              onClick={() => {
                const template = templateFor(type)

                editor.commands.setContent(template)
                setJson(JSON.stringify(template))
              }}
            >
              Isi kerangka {type}
            </button>
          ) : null}
        </div>
      </div>

      <input type="hidden" name={name} value={json} readOnly />

      {error ? (
        <p id={`${name}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

/** Terima hanya nilai yang benar-benar berbentuk dokumen ProseMirror. */
function asDocument(value: unknown): ProseMirrorDocument | null {
  if (
    typeof value === 'object' &&
    value !== null &&
    (value as ProseMirrorDocument).type === 'doc'
  ) {
    return value as ProseMirrorDocument
  }

  return null
}
