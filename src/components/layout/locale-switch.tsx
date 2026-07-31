'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'

import { cn } from '@/lib/cn'

/**
 * Toggle locale ID ↔ EN. Mengganti segmen locale di URL saat ini.
 */
export function LocaleSwitch() {
  const t = useTranslations('locale')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const nextLocale = locale === 'id' ? 'en' : 'id'

  function handleClick() {
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={locale === 'id' ? t('switchToEn') : t('switchToId')}
      title={locale === 'id' ? t('switchToEn') : t('switchToId')}
      className={cn(
        'inline-flex h-11 items-center gap-1.5 rounded-full',
        'border border-border bg-surface px-4 text-sm font-medium',
        'transition-colors hover:bg-elevated',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      )}
    >
      <span aria-hidden className="text-muted">
        {locale.toUpperCase()}
      </span>
      <span aria-hidden className="text-muted">
        →
      </span>
      <span>{nextLocale.toUpperCase()}</span>
    </button>
  )
}
