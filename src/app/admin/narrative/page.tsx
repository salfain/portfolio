import { NARRATIVE_KEYS } from '@/lib/schemas/site-settings'
import { getAdminNarrative } from '@/data/settings'

import { AdminShell } from '@/components/admin/admin-shell'

import { NarrativeEditor } from './narrative-editor'

export const dynamic = 'force-dynamic'

const sections = [
  {
    key: NARRATIVE_KEYS.whyWorkWithMe,
    title: 'Kenapa Bekerja dengan Saya',
    where: 'Beranda, bagian 5',
  },
  {
    key: NARRATIVE_KEYS.troubleshootingProcess,
    title: 'Cara Saya Menangani Masalah',
    where: 'Beranda, bagian 7 — blok diberi nomor urut otomatis',
  },
  {
    key: NARRATIVE_KEYS.aboutStory,
    title: 'Perjalanan Saya',
    where: 'Halaman Tentang',
  },
  {
    key: NARRATIVE_KEYS.aboutHowIWork,
    title: 'Cara Kerja',
    where: 'Halaman Tentang — blok diberi nomor urut otomatis',
  },
  {
    key: NARRATIVE_KEYS.aboutBeyondWork,
    title: 'Di Luar Pekerjaan Teknis',
    where: 'Halaman Tentang',
  },
] as const

/**
 * Seluruh bagian ini berisi klaim tentang cara kerja pemilik, jadi
 * teksnya tidak boleh ditulis developer (CLAUDE.md aturan mutlak §1).
 * Selama kosong, bagiannya tidak dirender sama sekali di situs.
 */
export default async function AdminNarrativePage() {
  // Dipasangkan langsung supaya tidak ada indeks lepas antara dua array.
  const editors = await Promise.all(
    sections.map(async (section) => ({
      ...section,
      blocks: await getAdminNarrative(section.key),
    })),
  )

  return (
    <AdminShell
      title="Bagian Naratif"
      description="Bagian yang isinya hanya boleh datang dari Anda. Selama kosong, bagiannya tidak muncul di situs."
    >
      <div className="space-y-12">
        {editors.map((editor) => (
          <section key={editor.key}>
            <h2 className="text-lg font-medium tracking-tight">
              {editor.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{editor.where}</p>
            <p className="mt-1 text-sm text-muted">
              {editor.blocks.length === 0
                ? 'Belum ada isi — bagian ini tidak muncul di situs.'
                : `${editor.blocks.length} blok tersimpan.`}
            </p>

            <div className="mt-6">
              <NarrativeEditor sectionKey={editor.key} blocks={editor.blocks} />
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  )
}
