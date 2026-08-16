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
      <Container className="py-10">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* Brand */}
          <div>
            <p className="text-base font-medium">{t('name')}</p>
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

        {/* Baris penutup: mono, huruf besar, dua ujung. */}
        <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-border pt-10 font-mono text-xs uppercase tracking-[0.08em] text-faint-2">
          <p className="text-left">
            © {year} {t('name')}
          </p>
          <p className="text-left">salfain.web.id</p>
        </div>
      </Container>
    </footer>
  )
}
