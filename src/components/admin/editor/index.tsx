'use client'

import dynamic from 'next/dynamic'

import { Skeleton } from '@/components/ui'

/**
 * Editor dimuat DINAMIS dan tanpa SSR.
 *
 * Tiptap dan ProseMirror berukuran besar dan hanya dipakai admin. Mengimpornya
 * langsung akan menariknya ke bundel bersama, sehingga setiap pengunjung
 * halaman publik ikut mengunduh kode editor yang tidak pernah mereka pakai.
 *
 * `ssr: false` juga wajib: Tiptap membaca `window` saat inisialisasi.
 *
 * Lihat CLAUDE.md tabel stack — "Tiptap (admin saja, dimuat dinamis)".
 */
export const RichTextEditor = dynamic(
  () => import('./rich-text-editor').then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-border bg-surface p-5">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="mt-4 h-[380px] w-full" />
      </div>
    ),
  },
)
