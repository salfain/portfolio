'use client'

import type { ComponentType, SVGProps } from 'react'
import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

import { isActivePath } from './nav-items'

type MobileBottomNavProps = {
  onOpenMenu: () => void
}

type BottomItem = {
  href: string
  key: 'home' | 'projects' | 'experience'
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const bottomItems: BottomItem[] = [
  { href: '/', key: 'home', icon: HomeIcon },
  { href: '/projects', key: 'projects', icon: ProjectsIcon },
  { href: '/experience', key: 'experience', icon: ExperienceIcon },
]

/**
 * Navigasi bawah untuk layar kecil.
 *
 * Tiga rute yang paling sering dicari diberi akses langsung. Rute lain tetap
 * tersedia lewat drawer supaya label panjang tidak membuat bar bergeser atau
 * terpotong di layar selebar 375px.
 */
export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const moreActive = !bottomItems.some((item) =>
    isActivePath(pathname, item.href),
  )

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden print:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-2">
        <nav
          aria-label={t('mobileNavLabel')}
          className="pointer-events-auto flex min-w-0 flex-1 items-stretch rounded-full border border-border bg-surface/95 p-1 shadow-lg backdrop-blur-md"
        >
          {bottomItems.map((item) => {
            const Icon = item.icon
            const active = isActivePath(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1.5 py-2 text-[0.65rem] font-medium leading-tight transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  active
                    ? 'bg-elevated text-foreground'
                    : 'text-muted hover:bg-elevated hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="max-w-full truncate">{t(item.key)}</span>
              </Link>
            )
          })}

          <button
            type="button"
            onClick={onOpenMenu}
            aria-label={t('openMenu')}
            aria-haspopup="dialog"
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1.5 py-2 text-[0.65rem] font-medium leading-tight transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              moreActive
                ? 'bg-elevated text-foreground'
                : 'text-muted hover:bg-elevated hover:text-foreground',
            )}
          >
            <MoreIcon className="h-5 w-5" aria-hidden="true" />
            <span className="max-w-full truncate">{t('more')}</span>
          </button>
        </nav>

        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={t('openMenu')}
          className={cn(
            'pointer-events-auto grid h-12 w-12 shrink-0 place-items-center rounded-full',
            'bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          )}
        >
          <ArrowIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9M9 20v-6h6v6" />
    </svg>
  )
}

function ProjectsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  )
}

function ExperienceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  )
}

function MoreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}
