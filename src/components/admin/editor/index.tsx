'use client'

import dynamic from 'next/dynamic'

/**
 * Tiptap dimuat DINAMIS dan hanya di klien.
 *
 * Dua alasan, keduanya wajib:
 *
 * 1. Editor ini ±200 kB. Memuatnya lewat impor biasa membuat setiap
 *    halaman admin membawanya, termasuk daftar dokumen yang tidak
 *    menyunting apa pun.
 * 2. `ssr: false` mencegah Tiptap dirender di server. ProseMirror
 *    menyentuh `document` saat inisialisasi, dan hasil render server
 *    tidak akan pernah cocok dengan hasil klien.
 *
 * Bundel halaman PUBLIK tidak terpengaruh sama sekali — tidak ada satu
 * pun rute publik yang mengimpor berkas ini.
 */
export const RichTextEditor = dynamic(
  () => import('./rich-text-editor').then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-border">
        <div className="h-[28rem] animate-pulse rounded-2xl bg-elevated" />
      </div>
    ),
  },
)
