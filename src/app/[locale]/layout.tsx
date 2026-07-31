import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale, getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google'

import { routing, type Locale } from '@/i18n/routing'
import { env } from '@/lib/env'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar, Footer, SkipLink } from '@/components/layout'

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type LayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: {
      default: `${t('siteName')} — IT Support`,
      template: `%s — ${t('siteName')}`,
    },
    description:
      locale === 'id'
        ? 'Portofolio & Knowledge Base IT Support — Muhammad Sya’ban Alfain.'
        : 'IT Support Portfolio & Knowledge Base — Muhammad Sya’ban Alfain.',
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale as never)) {
    notFound()
  }

  setRequestLocale(locale as Locale)

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} min-h-dvh bg-background text-foreground antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SkipLink />
            <div className="flex min-h-dvh flex-col">
              <Navbar />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
