import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'

import idMessages from '../../../messages/id.json'
import { ThemeProvider } from '@/components/theme-provider'

// Admin merender <html> sendiri, jadi variabel font tidak diwarisi dari
// rute publik dan harus dipasang di sini juga.
const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})
const fontDisplay = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})
const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

/**
 * Admin: tanpa segmen locale, nested layout (root layout pass-through).
 * Antarmuka hanya bahasa Indonesia.
 *
 * Tema panel admin dipisahkan dari tema situs publik lewat `storageKey`
 * sendiri: keduanya dipakai dalam situasi berbeda, dan admin yang bekerja
 * berjam-jam di panel gelap belum tentu ingin situs publiknya ikut gelap
 * saat memeriksa hasil.
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
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} min-h-dvh bg-background text-foreground antialiased`}
      >
        <NextIntlClientProvider locale="id" messages={idMessages}>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="light"
            storageKey="msa-admin-theme"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
