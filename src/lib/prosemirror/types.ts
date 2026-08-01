import { z } from 'zod'

/**
 * Bentuk dokumen ProseMirror (format simpan Tiptap).
 *
 * Skema ini sengaja PERMISIF: node dan mark yang tidak dikenal tetap lolos
 * parsing, lalu diabaikan saat render. Dokumen yang dibuat editor versi
 * lebih baru tidak boleh membuat halaman publik gagal render — kehilangan
 * satu blok jauh lebih baik daripada kehilangan seluruh halaman.
 *
 * Yang TIDAK permisif: `render.tsx` hanya merender node yang dikenal, dan
 * tidak pernah menyisipkan HTML mentah. Lihat docs/rules/06_SECURITY.md §4.
 */

export type ProseMirrorMark = {
  type: string
  attrs?: Record<string, unknown>
}

export type ProseMirrorNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: ProseMirrorNode[]
  marks?: ProseMirrorMark[]
  text?: string
}

const markSchema: z.ZodType<ProseMirrorMark> = z.object({
  type: z.string(),
  attrs: z.record(z.unknown()).optional(),
})

export const nodeSchema: z.ZodType<ProseMirrorNode> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.unknown()).optional(),
    content: z.array(nodeSchema).optional(),
    marks: z.array(markSchema).optional(),
    text: z.string().optional(),
  }),
)

export const documentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(nodeSchema).optional(),
})

export type ProseMirrorDocument = z.infer<typeof documentSchema>

/**
 * Dokumen yang tidak memuat apa pun yang layak dirender.
 *
 * Editor kosong TIDAK menghasilkan `content: []` — ProseMirror selalu
 * menyisakan satu paragraf kosong. Tanpa pemeriksaan ini, isi bahasa
 * Inggris yang dibiarkan kosong tersimpan sebagai dokumen "ada tapi
 * hampa", dan halaman `/en` akan menampilkan badan kosong alih-alih
 * jatuh ke versi Indonesia beserta pemberitahuannya
 * (08_I18N_FALLBACK_POLICY §3).
 *
 * Node tanpa teks yang tetap berarti — gambar, garis, tabel, blok
 * perintah — dihitung sebagai isi.
 */
const MEANINGFUL_WITHOUT_TEXT = new Set([
  'image',
  'horizontalRule',
  'table',
  'codeBlock',
])

export function isEmptyDocument(doc: ProseMirrorDocument): boolean {
  function hasContent(nodes: ProseMirrorNode[]): boolean {
    return nodes.some((node) => {
      if (MEANINGFUL_WITHOUT_TEXT.has(node.type)) return true
      if (typeof node.text === 'string' && node.text.trim() !== '') return true

      return node.content ? hasContent(node.content) : false
    })
  }

  return !hasContent(doc.content ?? [])
}

/**
 * Parse nilai `Json` dari Prisma menjadi dokumen.
 *
 * Mengembalikan `null` bila bentuknya bukan dokumen — pemanggil merender
 * empty state, bukan melempar. Isi yang rusak di satu dokumen tidak boleh
 * menjatuhkan seluruh rute.
 */
export function parseDocument(value: unknown): ProseMirrorDocument | null {
  const parsed = documentSchema.safeParse(value)

  return parsed.success ? parsed.data : null
}
