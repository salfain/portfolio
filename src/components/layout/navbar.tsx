'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

import { ThemeToggle } from '@/components/theme-toggle'
import { LocaleSwitch } from './locale-switch'
import { MobileDrawer } from './mobile-drawer'
import { isActivePath, navItems } from './nav-items'

export function Navbar() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <header className="sk-raised sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md print:hidden">
      <nav className="mx-auto flex h-16 max-w-container items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight"
        >
          {t('siteName')}
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-elevated text-foreground'
                      : 'text-muted hover:bg-elevated hover:text-foreground',
                  )}
                >
                  {t(item.key)}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LocaleSwitch />
          </div>
          <ThemeToggle />

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t('openMenu')}
            className={cn(
              'grid h-11 w-11 place-items-center rounded-full',
              'border border-border bg-surface text-foreground',
              'transition-colors hover:bg-elevated md:hidden',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
            )}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </header>
  )
}
