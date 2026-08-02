import type { ProseMirrorDocument } from '@/lib/prosemirror/types'
import type { KnowledgeTypeValue } from '@/lib/schemas/admin'

/**
 * Kerangka dokumen per tipe.
 *
 * Isinya HANYA judul bagian — tidak ada satu pun kalimat isi, angka, nama
 * instansi, atau contoh perintah. Template yang datang berisi contoh
 * "supaya kelihatan" adalah cara paling mudah fakta karangan menyelinap ke
 * dokumen terbit (CLAUDE.md aturan 1).
 *
 * Urutan bagiannya mengikuti deliverable Fase 6 di `docs/01_PHASES.md`,
 * supaya dokumen yang ditulis sekarang tidak perlu disusun ulang nanti.
 */

const heading = (text: string): ProseMirrorDocument['content'] => [
  { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] },
  { type: 'paragraph' },
]

function build(sections: string[]): ProseMirrorDocument {
  return {
    type: 'doc',
    content: sections.flatMap((section) => heading(section) ?? []),
  }
}

const SECTIONS: Record<KnowledgeTypeValue, string[]> = {
  SOP: [
    'Tujuan',
    'Ruang lingkup',
    'Prasyarat',
    'Langkah pengerjaan',
    'Validasi hasil',
    'Bila langkah gagal',
    'Dokumen terkait',
  ],
  LAB: [
    'Topologi',
    'Perangkat dan antarmuka',
    'Rencana IP dan VLAN',
    'Konfigurasi',
    'Kasus uji',
    'Simulasi gangguan',
    'Hasil yang diharapkan dan hasil sebenarnya',
    'Catatan',
  ],
  INCIDENT: [
    'Ringkasan insiden',
    'Dampak dan urgensi',
    'Kronologi',
    'Langkah troubleshooting',
    'Akar masalah',
    'Solusi sementara',
    'Penyelesaian',
    'Validasi',
    'Pencegahan berulang',
    'SOP terkait',
  ],
  ARTICLE: [
    'Latar belakang',
    'Penjelasan',
    'Contoh penerapan',
    'Kesalahpahaman yang sering terjadi',
    'Ringkasan',
  ],
}

export function templateFor(type: KnowledgeTypeValue): ProseMirrorDocument {
  return build(SECTIONS[type])
}

export const TEMPLATE_SECTION_COUNT: Record<KnowledgeTypeValue, number> =
  Object.fromEntries(
    Object.entries(SECTIONS).map(([type, sections]) => [type, sections.length]),
  ) as Record<KnowledgeTypeValue, number>
