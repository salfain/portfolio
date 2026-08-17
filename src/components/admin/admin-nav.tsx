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
 *
 * Daftarnya dikelompokkan tiga (redesign 2026). Dua belas tautan datar
 * memaksa pembacaan satu per satu setiap kali; label grup memberi tempat
 * berpijak sebelum memindai isinya.
 */
type NavGroup = {
  label: string
  items: { href: string; label: string }[]
}

const groups: NavGroup[] = [
  {
    label: 'Ringkasan',
    items: [
      { href: '/admin', label: 'Dasbor' },
      { href: '/admin/messages', label: 'Pesan' },
    ],
  },
  {
    label: 'Konten',
    items: [
      { href: '/admin/projects', label: 'Proyek' },
      { href: '/admin/experiences', label: 'Pengalaman' },
      { href: '/admin/skills', label: 'Keahlian' },
      { href: '/admin/certifications', label: 'Sertifikat' },
      { href: '/admin/knowledge', label: 'Basis Pengetahuan' },
      { href: '/admin/taxonomy', label: 'Taksonomi' },
    ],
  },
  {
    label: 'Situs',
    items: [
      { href: '/admin/profile', label: 'Profil' },
      { href: '/admin/narrative', label: 'Narasi' },
      { href: '/admin/audit', label: 'Audit' },
      { href: '/admin/backup', label: 'Cadangan' },
      { href: '/admin/account', label: 'Akun' },
    ],
  },
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
      className="flex flex-col gap-7 border-b border-border pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6"
    >
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="kicker mb-1 px-3">{group.label}</p>

          {group.items.map((item) => {
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
                  'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  isActive
                    ? 'bg-elevated font-medium text-foreground'
                    : 'text-muted hover:text-foreground',
                )}
              >
                {item.label}
                {item.href === '/admin/messages' && unreadCount > 0 ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[11px] text-primary-foreground">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>
      ))}

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className={cn(
          'mt-2 rounded-md border border-border-med px-3 py-2 text-left text-sm text-muted transition-colors',
          'hover:border-border-hover hover:text-foreground disabled:opacity-50',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        )}
      >
        {signingOut ? 'Keluar…' : 'Keluar'}
      </button>
    </nav>
  )
}
