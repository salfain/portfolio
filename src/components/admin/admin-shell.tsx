import { type ReactNode } from 'react'
import Link from 'next/link'

import { requireAdminPage } from '@/data/_guards'
import { countUnreadMessages } from '@/data/contact'

import { AdminNav } from './admin-nav'
import { AdminThemeToggle } from './admin-theme-toggle'

type AdminShellProps = {
  title: string
  description?: string
  /** Tombol aksi di kanan judul, mis. "Tambah proyek". */
  action?: ReactNode
  children: ReactNode
}

/**
 * Kerangka setiap halaman admin yang butuh sesi.
 *
 * Pemeriksaan sesi ada DI SINI, bukan hanya di middleware — middleware
 * Next.js tidak dijamin berjalan pada setiap jalur pemanggilan
 * (06_SECURITY §2). Halaman login sengaja tidak memakai komponen ini.
 *
 * Tata letak mengikuti `Admin Redesign.dc.html`: sidebar 248px yang
 * melekat setinggi layar, dan isi memakai lebar penuh tanpa kontainer
 * terpusat. Panel admin adalah alat kerja, bukan halaman baca — tabel
 * yang dipaksa masuk kolom 1180px malah kehilangan kolomnya.
 */
export async function AdminShell({
  title,
  description,
  action,
  children,
}: AdminShellProps) {
  const session = await requireAdminPage()

  const unreadCount = await countUnreadMessages()

  return (
    <div className="grid min-h-dvh md:grid-cols-[248px_minmax(0,1fr)]">
      <AdminNav
        unreadCount={unreadCount}
        userName={session.user.name || session.user.email}
      />

      <main className="min-w-0 px-5 pb-20 pt-6 sm:px-8 md:px-10 md:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          {/* Remah roti, bukan judul — judul halaman ada di bawahnya.
              Ini penanda posisi di dalam panel. */}
          <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.1em] text-faint">
            <span>Admin</span>
            <span aria-hidden>/</span>
            <span className="text-text-3">{title}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border-med px-3 py-1.5 font-mono text-xs text-muted">
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              />
              Situs aktif
            </span>

            <AdminThemeToggle />

            <Link
              href="/"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border-med px-3 py-1.5 font-mono text-xs uppercase tracking-[0.06em] text-muted transition-colors hover:border-border-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Lihat situs
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </div>

        <header className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-[28px] leading-tight md:text-[32px]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-[70ch] text-sm text-muted">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>

        <div className="mt-8">{children}</div>
      </main>
    </div>
  )
}
