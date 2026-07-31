import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

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
    // Kosong dulu — diisi Fase 5 (R2 / S3-compatible)
    remotePatterns: [],
  },
}

export default nextIntl(nextConfig)
