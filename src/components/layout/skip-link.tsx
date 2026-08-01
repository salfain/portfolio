import { useTranslations } from 'next-intl'

import { cn } from '@/lib/cn'

/**
 * Skip link — elemen fokus pertama di setiap halaman.
 * Tersembunyi sampai difokus. Lihat docs/rules/05_ACCESSIBILITY.md §3.
 */
export function SkipLink() {
  const t = useTranslations('a11y')

  return (
    <a
      href="#main-content"
      className={cn(
        'sr-only focus:not-sr-only',
        'fixed left-4 top-4 z-[100] rounded-md bg-primary px-4 py-2',
        'text-sm font-medium text-primary-foreground',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      )}
    >
      {t('skipToContent')}
    </a>
  )
}
