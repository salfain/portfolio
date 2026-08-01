import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

// Terlokalisasi: 404 bahasa ID di rute /id = cacat (05_ROUTE §5).
export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <div className="mx-auto grid min-h-[60vh] max-w-container place-items-center px-5 sm:px-8 lg:px-12">
      <div className="text-center">
        <p className="font-display text-6xl font-semibold text-primary">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold md:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-muted">{t('description')}</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t('backHome')}
        </Link>
      </div>
    </div>
  )
}
