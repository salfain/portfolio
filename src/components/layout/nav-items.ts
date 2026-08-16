import { features } from '@/lib/features'

export type NavItem = {
  href: string
  /** Kunci di namespace `nav`. */
  key: string
}

/**
 * Satu sumber daftar navigasi untuk navbar desktop dan drawer mobile.
 * Sebelumnya daftar ini digandakan di dua berkas — menambah rute berarti
 * menyunting keduanya, dan yang terlewat baru ketahuan di perangkat lain.
 *
 * `/knowledge` baru dibuka di Fase 4 (05_ROUTE_AND_PRIORITY_MAP §2).
 */
export const navItems: NavItem[] = [
  { href: '/', key: 'home' },
  { href: '/about', key: 'about' },
  { href: '/projects', key: 'projects' },
  { href: '/experience', key: 'experience' },
  ...(features.knowledgeBase ? [{ href: '/knowledge', key: 'knowledge' }] : []),
  { href: '/contact', key: 'contact' },
]

/** Tautan sekunder di footer. */
export const footerItems: NavItem[] = [
  { href: '/expertise', key: 'expertise' },
  { href: '/certifications', key: 'certifications' },
  { href: '/recruiter', key: 'recruiter' },
  { href: '/privacy', key: 'privacy' },
  { href: '/terms', key: 'terms' },
]

/** Apakah `pathname` berada di dalam `href`? */
export function isActivePath(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}
