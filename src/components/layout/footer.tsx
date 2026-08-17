import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { Container } from './container'
import { footerItems } from './nav-items'

/**
 * Footer minimal sesuai handoff: satu baris mono, dua ujung.
 *
 * Blok merek dan dua kolom tautan navigasi dihapus — seluruh isinya sudah
 * ada di navbar, dan mengulangnya di dasar setiap halaman hanya menambah
 * satu layar penuh tanpa memberi jalan baru ke mana pun.
 *
 * Yang TIDAK ikut dihapus: tautan sekunder (Keahlian, Mode Recruiter,
 * Kebijakan Privasi, Ketentuan). Empat rute itu tidak ada di navbar, jadi
 * menghapusnya dari sini membuat keduanya tidak bisa dicapai dari
 * halaman mana pun — dan halaman kebijakan yang tidak bisa dijangkau
 * bukan sekadar kerugian tampilan. Bentuknya dipadatkan jadi satu baris
 * mono, bukan dua kolom.
 */
export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border print:hidden">
      <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-8 font-mono text-xs tracking-[0.08em] text-faint-2">
        <p className="uppercase">
          © {year} {t('name')}
        </p>

        <nav aria-label={t('navLabel')}>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {footerItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-6 items-center rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="uppercase">salfain.web.id</p>
      </Container>
    </footer>
  )
}
