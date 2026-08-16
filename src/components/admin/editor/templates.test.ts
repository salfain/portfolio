import { describe, expect, it } from 'vitest'

import { documentText } from '@/lib/prosemirror/headings'
import { documentSchema } from '@/lib/prosemirror/types'
import { KNOWLEDGE_TYPE_LABEL } from '@/lib/schemas/admin'

import { templateFor } from './templates'

const TYPES = Object.keys(
  KNOWLEDGE_TYPE_LABEL,
) as (keyof typeof KNOWLEDGE_TYPE_LABEL)[]

describe('template dokumen', () => {
  it.each(TYPES)('%s menghasilkan dokumen yang sah bagi renderer', (type) => {
    expect(documentSchema.safeParse(templateFor(type)).success).toBe(true)
  })

  it.each(TYPES)('%s hanya berisi judul bagian, tanpa isi', (type) => {
    const nodes = templateFor(type).content ?? []

    const headings = nodes.filter((node) => node.type === 'heading')
    const paragraphs = nodes.filter((node) => node.type === 'paragraph')

    expect(headings.length).toBeGreaterThan(0)
    // Setiap judul diikuti satu paragraf kosong sebagai tempat menulis.
    expect(paragraphs).toHaveLength(headings.length)
    expect(paragraphs.every((node) => node.content === undefined)).toBe(true)
  })

  it.each(TYPES)(
    '%s tidak memuat angka — template tidak boleh membawa fakta',
    (type) => {
      // Aturan 1 CLAUDE.md: tidak ada angka pengalaman, jumlah tiket, atau
      // metrik apa pun tanpa sumber. Template yang datang berisi contoh
      // angka adalah jalan termudah fakta karangan ikut terbit.
      expect(documentText(templateFor(type))).not.toMatch(/\d/)
    },
  )
})
