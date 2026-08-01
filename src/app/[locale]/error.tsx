'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('error')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto grid min-h-[60vh] max-w-container place-items-center px-5 sm:px-8 lg:px-12">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-muted">{t('description')}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t('retry')}
        </button>
        <div className="mt-4">
          <Link
            href="/"
            className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
          >
            {'<-'}
          </Link>
        </div>
      </div>
    </div>
  )
}
