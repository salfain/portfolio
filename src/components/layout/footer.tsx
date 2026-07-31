import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { Container } from './container'
import { footerItems, navItems } from './nav-items'

export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const year = new Date().getFullYear()

  // Beranda sudah diwakili nama di kolom brand.
  const primary = navItems.filter((item) => item.href !== '/')

  return (
    <footer className="border-t border-border print:hidden">
      <Container className="py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div>
            <p className="font-display text-base font-semibold">{t('name')}</p>
            <p className="mt-1 text-sm text-muted">{t('role')}</p>
          </div>

          <nav aria-label={t('navLabel')}>
            <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
              <ul className="space-y-2">
                {primary.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-sm text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {tNav(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>

              <ul className="space-y-2">
                {footerItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-sm text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {tNav(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted">
            © {year} {t('name')}. {t('rights')}
          </p>
        </div>
      </Container>
    </footer>
  )
}
