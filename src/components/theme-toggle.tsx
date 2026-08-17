'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/cn'

export function ThemeToggle() {
  const t = useTranslations('theme')
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Hindari hydration mismatch: render placeholder sampai ter-mount.
  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('toggleAriaLabel')}
      title={isDark ? t('toLight') : t('toDark')}
      /**
       * Lingkaran yang TERLIHAT 34px sesuai handoff, tapi area sentuhnya
       * 44px sesuai 02_STYLING §9. Tombol luarnya transparan tanpa garis;
       * yang bergaris adalah lingkaran di dalamnya. Menyusutkan tombolnya
       * sendiri ke 34px akan membuat target sentuh di mobile lebih kecil
       * dari batas yang dipakai seluruh situs ini.
       */
      className={cn(
        'group grid h-11 w-11 place-items-center rounded-full bg-transparent',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'grid h-[34px] w-[34px] place-items-center rounded-full',
          'border border-border-med text-muted transition-colors',
          'group-hover:border-border-hover group-hover:text-foreground',
        )}
      >
        {mounted ? (
          isDark ? (
            <SunIcon className="h-4 w-4" />
          ) : (
            <MoonIcon className="h-4 w-4" />
          )
        ) : (
          <span className="h-4 w-4" />
        )}
      </span>
    </button>
  )
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}
