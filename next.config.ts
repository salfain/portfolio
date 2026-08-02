import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

import { securityHeaders } from './src/lib/security-headers'

const nextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * `next dev` dan `next build` berbagi satu direktori `.next` dan saling
   * menimpa — dev server yang sedang jalan akan rusak begitu build produksi
   * dijalankan, dan sebaliknya.
   *
   * Default tetap `.next` supaya CI dan produksi tidak berubah. Untuk
   * memverifikasi build tanpa mengganggu dev server yang sedang berjalan:
   *
   *   NEXT_DIST_DIR=.next-verify npm run build
   *   NEXT_DIST_DIR=.next-verify PORT=5322 npm start
   */
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: {
    // Prisma Client best practice: generate client di build
    // (tidak wajib, tapi konvensi)
  },
  images: {
    /**
     * Sengaja tetap KOSONG.
     *
     * Seluruh bukti disajikan dari origin sendiri lewat `/media/[...key]`,
     * yang memeriksa izinnya per permintaan. Menambahkan host luar di sini
     * berarti memercayai host itu untuk memasok gambar ke halaman kita —
     * dan tidak ada satu pun yang perlu dipercaya sejauh itu.
     */
    remotePatterns: [],
  },

  /**
   * Header keamanan untuk SEMUA rute.
   *
   * Ditaruh di sini, bukan di middleware: middleware tidak berjalan untuk
   * aset statis dan berkas yang punya ekstensi (lihat matcher-nya), jadi
   * header dari sana akan bolong justru di jalur yang paling sering
   * diminta.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders(process.env.NODE_ENV === 'development'),
      },
    ]
  },
}

export default nextIntl(nextConfig)
