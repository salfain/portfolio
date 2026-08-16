'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

import { ThemeToggle } from '@/components/theme-toggle'
import { CommandPalette } from '@/components/search'
import { LocaleSwitch } from './locale-switch'
import { MobileDrawer } from './mobile-drawer'
import { MobileBottomNav } from './mobile-bottom-nav'
import { isActivePath, navItems } from './nav-items'

/**
 * Bar kaca melayang (redesign 2026).
 *
 * Pembungkusnya `pointer-events-none` supaya sisa lebar di kiri-kanan bar
 * tidak menangkap klik yang seharusnya jatuh ke halaman di belakangnya;
 * bar-nya sendiri mengaktifkan kembali pointer.
 *
 * Menu tengah bisa digulir horizontal (`overflow-x-auto`) alih-alih
 * membungkus ke baris kedua — tujuh tautan yang membungkus akan menaikkan
 * tinggi bar dan menggeser seluruh halaman.
 */
export function Navbar() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header className="pointer-events-none sticky top-0 z-40 py-4 print:hidden">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <nav
            className={cn(
              'pointer-events-auto grid items-center gap-5 rounded-2xl',
              'grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)]',
              'border border-[var(--glass-line)] bg-[var(--glass-bg)] shadow-nav',
              'py-3 pl-5 pr-4 backdrop-blur-[18px] backdrop-saturate-150',
            )}
          >
            {/* Brand */}
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2.5 whitespace-nowrap"
            >
              <span
                aria-hidden
                className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-glow)] font-mono text-xs text-primary"
              >
                M
              </span>
              <span className="hidden truncate text-base font-medium sm:block">
                {t('siteName')}
              </span>
            </Link>

            {/* Menu tengah */}
            <ul className="hidden min-w-0 items-center justify-center gap-0.5 overflow-x-auto [scrollbar-width:none] md:flex">
              {navItems.map((item) => {
                const isActive = isActivePath(pathname, item.href)

                return (
                  <li key={item.href} className="shrink-0">
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'block whitespace-nowrap rounded-full px-2.5 py-2 text-[15px] transition-colors',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted hover:text-foreground',
                      )}
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                )
              })}
            </ul>
            {/* Kolom tengah tetap ada di mobile supaya grid tiga kolom
                tidak runtuh dan aksi kanan tidak melompat ke tengah. */}
            <span className="md:hidden" aria-hidden />

            {/* Aksi kanan */}
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden sm:block">
                <CommandPalette />
              </div>
              <ThemeToggle />
              <div className="hidden sm:block">
                <LocaleSwitch />
              </div>
            </div>
          </nav>
        </div>

        <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      </header>

      <MobileBottomNav onOpenMenu={() => setDrawerOpen(true)} />
    </>
  )
}
