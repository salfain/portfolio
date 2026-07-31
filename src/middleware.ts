import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

/**
 * Nama cookie sesi Better Auth. Varian `__Secure-` dipakai saat cookie
 * diterbitkan di koneksi HTTPS (produksi).
 *
 * Cookie dibaca langsung, BUKAN lewat `getSessionCookie()` dari
 * `better-auth/cookies`: helper itu menarik `jose`, yang memakai
 * `CompressionStream` dan tidak didukung Edge Runtime. Middleware ini
 * hanya perlu tahu cookie-nya ada, jadi tidak butuh kripto sama sekali.
 */
const SESSION_COOKIES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
]

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => {
    const value = request.cookies.get(name)?.value

    return value !== undefined && value !== ''
  })
}

/**
 * Guard `/admin/*`.
 *
 * Pemeriksaan OPTIMIS: hanya memastikan cookie sesi ada, tanpa
 * memvalidasinya ke database — middleware berjalan di Edge dan tidak
 * bisa memakai Prisma. Gunanya pengalaman pengguna: pengunjung tanpa
 * sesi diarahkan ke login, bukan menabrak error.
 *
 * Keamanannya TIDAK bergantung pada lapisan ini. Setiap halaman admin
 * memvalidasi sesi lewat `auth.api.getSession()` dan setiap fungsi
 * `getAdmin*` memanggil `requireAdmin()` — cookie palsu tetap ditolak
 * di server. Lihat docs/rules/06_SECURITY.md §2.
 */
function adminMiddleware(request: NextRequest) {
  // Halaman login harus tetap terbuka, kalau tidak jadi lingkaran redirect.
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  if (!hasSessionCookie(request)) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export default function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return adminMiddleware(request)
  }

  return intlMiddleware(request)
}

export const config = {
  // Rute publik ditangani next-intl; `/admin/*` ditangani adminMiddleware.
  // API Better Auth dan aset statis dilewati sepenuhnya.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
