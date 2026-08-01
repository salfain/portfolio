'use client'

import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from '@/components/ui/drawer'
import { LocaleSwitch } from './locale-switch'
import { footerItems, isActivePath, navItems } from './nav-items'

type MobileDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right">
        <DrawerTitle className="sr-only">{t('menu')}</DrawerTitle>

        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-6">
            <span className="font-display text-lg font-semibold">
              {t('siteName')}
            </span>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={t('closeMenu')}
              className={cn(
                'grid h-9 w-9 place-items-center rounded-full',
                'text-muted hover:bg-elevated hover:text-foreground',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              )}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = isActivePath(pathname, item.href)

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        'block rounded-xl px-4 py-3 text-base font-medium transition-colors',
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

            {/* Rute sekunder — di desktop tempatnya di footer, tapi di
                mobile footer berada jauh di bawah gulir. */}
            <ul className="mt-4 space-y-1 border-t border-border pt-4">
              {footerItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className="block rounded-xl px-4 py-2.5 text-sm text-muted transition-colors hover:bg-elevated hover:text-foreground"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-border pt-6">
            <LocaleSwitch onNavigate={() => onOpenChange(false)} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
