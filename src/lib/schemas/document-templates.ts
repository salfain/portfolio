import type { KnowledgeType } from '@prisma/client'

import type {
  ProseMirrorDocument,
  ProseMirrorNode,
} from '@/lib/prosemirror/types'

/**
 * Kerangka blok wajib per tipe dokumen.
 *
 * Diturunkan dari `04_SEED_CONTENT_DRAFT.md` §3 (yang sendirinya dari PRD
 * bab 11). Template hanya menyisipkan JUDUL bagian — isinya tetap ditulis
 * pemilik. Tidak ada satu kalimat isi pun yang dikarang di sini.
 *
 * Gunanya bukan menghemat ketikan, melainkan supaya tidak ada blok wajib
 * yang terlewat: SOP tanpa bagian "Eskalasi" baru ketahuan hilang saat
 * seseorang benar-benar butuh eskalasi.
 */

function heading(text: string): ProseMirrorNode {
  return {
    type: 'heading',
    attrs: { level: 2 },
    content: [{ type: 'text', text }],
  }
}

function emptyParagraph(): ProseMirrorNode {
  return { type: 'paragraph' }
}

function build(sections: string[]): ProseMirrorDocument {
  return {
    type: 'doc',
    content: sections.flatMap((section) => [
      heading(section),
      emptyParagraph(),
    ]),
  }
}

/** Judul bagian per tipe. Tanda ✔ di dokumen sumber = wajib. */
const SECTIONS: Record<KnowledgeType, string[]> = {
  SOP: [
    'Tujuan',
    'Ruang lingkup',
    'Penanggung jawab',
    'Prasyarat',
    'Prosedur',
    'Validasi',
    'Eskalasi',
    'Catatan keamanan',
    'Rollback',
  ],
  LAB: [
    'Tujuan pembelajaran',
    'Skenario',
    'Topologi',
    'Daftar perangkat & interface',
    'Rencana IP & VLAN',
    'Langkah konfigurasi',
    'Blok perintah',
    'Test case',
    'Simulasi gangguan',
    'Hasil & bukti',
    'Pelajaran',
  ],
  INCIDENT: [
    'Nomor insiden',
    'Dampak, urgensi, prioritas',
    'Layanan terdampak',
    'Gejala',
    'Timeline',
    'Investigasi',
    'Akar masalah',
    'Workaround',
    'Penyelesaian',
    'Validasi',
    'Pencegahan',
  ],
  ARTICLE: [
    'Pendahuluan',
    'Konsep',
    'Contoh praktis',
    'Kesalahan umum',
    'Kesimpulan',
  ],
}

export function templateFor(type: KnowledgeType): ProseMirrorDocument {
  return build(SECTIONS[type])
}

export function templateSectionCount(type: KnowledgeType): number {
  return SECTIONS[type].length
}

/**
 * Blok wajib yang belum ada di dokumen.
 *
 * Dipakai admin sebagai peringatan lembut sebelum menerbitkan — bukan
 * penghalang. Menolak menerbitkan karena satu judul tidak persis sama akan
 * lebih sering salah daripada benar.
 */
export function missingSections(
  type: KnowledgeType,
  headings: string[],
): string[] {
  const present = new Set(headings.map((text) => text.trim().toLowerCase()))

  return SECTIONS[type].filter((section) => !present.has(section.toLowerCase()))
}
