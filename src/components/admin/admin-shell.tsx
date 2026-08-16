import { type ReactNode } from 'react'

import { requireAdminPage } from '@/data/_guards'
import { countUnreadMessages } from '@/data/contact'

import { AdminNav } from './admin-nav'

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
 */
export async function AdminShell({
  title,
  description,
  action,
  children,
}: AdminShellProps) {
  await requireAdminPage()

  const unreadCount = await countUnreadMessages()

  return (
    <div className="mx-auto max-w-container px-5 py-8 sm:px-8 lg:px-12">
      <div className="grid gap-8 md:grid-cols-[248px_minmax(0,1fr)]">
        <AdminNav unreadCount={unreadCount} />

        <main>
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              {/* Remah roti mono: menandai bahwa yang dilihat adalah panel
                  admin, bukan halaman publik dengan judul yang sama. */}
              <p className="kicker mb-3">Admin · {title}</p>
              <h1 className="font-display text-[42px] leading-none">{title}</h1>
              {description ? (
                <p className="mt-3 max-w-[62ch] text-sm text-muted">
                  {description}
                </p>
              ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </header>

          <div className="mt-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
