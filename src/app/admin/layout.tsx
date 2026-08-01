import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { Geist, Geist_Mono } from 'next/font/google'

import idMessages from '../../../messages/id.json'

// Admin merender <html> sendiri, jadi variabel font tidak diwarisi dari
// rute publik dan harus dipasang di sini juga.
const fontSans = Geist({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const fontDisplay = Geist({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const fontMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

/**
 * Admin: tanpa segmen locale, nested layout (root layout pass-through).
 * Antarmuka hanya bahasa Indonesia. Tema terang default.
 *
 * `NextIntlClientProvider` dipasang BUKAN untuk menerjemahkan antarmuka
 * admin — teksnya memang ditulis langsung dalam bahasa Indonesia
 * (05_ROUTE_AND_PRIORITY_MAP §3). Gunanya supaya komponen bersama yang
 * dipakai ulang dari sisi publik — terutama `ProseMirrorContent` beserta
 * `CodeBlock` di dalam pratinjau dokumen — punya sumber terjemahan.
 *
 * Tanpa ini, pratinjau harus memakai renderer duplikat, dan pratinjau yang
 * berbeda dari hasil sebenarnya lebih buruk daripada tidak ada pratinjau.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" data-theme="light" suppressHydrationWarning>
      <body
        className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} min-h-dvh bg-background text-foreground antialiased`}
      >
        <NextIntlClientProvider locale="id" messages={idMessages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
