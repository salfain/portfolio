'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/cn'

/**
 * Navigasi admin.
 *
 * `next/link` dan `next/navigation` dipakai langsung di sini — DISENGAJA.
 * Aturan "Link selalu dari @/i18n/navigation" berlaku untuk rute publik
 * yang berawalan locale. Rute admin tidak berawalan locale
 * (05_ROUTE_AND_PRIORITY_MAP §3), jadi Link ber-locale justru salah.
 */
const items = [
  { href: '/admin', label: 'Dasbor' },
  { href: '/admin/profile', label: 'Profil' },
  { href: '/admin/experiences', label: 'Pengalaman' },
  { href: '/admin/projects', label: 'Proyek' },
  { href: '/admin/skills', label: 'Keahlian' },
  { href: '/admin/certifications', label: 'Sertifikat' },
  { href: '/admin/narrative', label: 'Bagian Naratif' },
  { href: '/admin/knowledge', label: 'Knowledge Base' },
  { href: '/admin/categories', label: 'Kategori' },
  { href: '/admin/tags', label: 'Tag' },
  { href: '/admin/messages', label: 'Pesan' },
]

type AdminNavProps = {
  unreadCount: number
}

export function AdminNav({ unreadCount }: AdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav
      aria-label="Navigasi admin"
      className="flex flex-col gap-1 border-b border-border pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6"
    >
      {items.map((item) => {
        const isActive =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              isActive
                ? 'bg-elevated font-medium text-foreground'
                : 'text-muted hover:bg-elevated hover:text-foreground',
            )}
          >
            {item.label}
            {item.href === '/admin/messages' && unreadCount > 0 ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                {unreadCount}
              </span>
            ) : null}
          </Link>
        )
      })}

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className={cn(
          'mt-4 rounded-xl px-3 py-2 text-left text-sm text-muted transition-colors',
          'hover:bg-elevated hover:text-foreground disabled:opacity-50',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        )}
      >
        {signingOut ? 'Keluar…' : 'Keluar'}
      </button>
    </nav>
  )
}
