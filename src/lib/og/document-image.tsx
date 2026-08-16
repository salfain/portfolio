import { ImageResponse } from 'next/og'

import { getPublishedDocumentBySlug } from '@/data/knowledge'
import { pickLocale } from '@/lib/i18n-content'
import { typeForSegment, type TypeSegment } from '@/lib/knowledge-type'
import { routing, type Locale } from '@/i18n/routing'

/**
 * Gambar Open Graph per dokumen, dibuat saat diminta.
 *
 * Isinya HANYA berasal dari dokumen itu sendiri: judul, ringkasan, kode.
 * Tidak ada aset yang disalin dari mana pun (CLAUDE.md aturan 5), dan
 * tidak ada angka atau klaim yang tidak ada di dokumennya (aturan 1).
 *
 * Dipakai bersama oleh empat rute detail. Keempatnya rute STATIS
 * (`/knowledge/sop/[slug]`, `/knowledge/labs/[slug]`, …) — keputusan Fase 4
 * yang tidak diubah di sini — jadi berkas `opengraph-image.tsx` harus ada
 * di masing-masing folder. Yang dibagikan implementasinya, bukan rutenya.
 *
 * Slug draft atau tidak dikenal tetap menghasilkan gambar, bukan galat:
 * `getPublishedDocumentBySlug` mengembalikan `null` dan yang tampil adalah
 * kartu umum tanpa satu pun isi dokumen. Perayap yang meminta gambar untuk
 * URL yang tidak ada tidak boleh membuat rute ini melempar.
 */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

const COLORS = {
  background: '#0b1220',
  foreground: '#f8fafc',
  muted: '#94a3b8',
  body: '#cbd5e1',
}

export async function renderDocumentOgImage(
  segment: TypeSegment,
  params: { locale: string; slug: string },
) {
  const locale = (
    routing.locales.includes(params.locale as Locale)
      ? params.locale
      : routing.defaultLocale
  ) as Locale

  const document = await getPublishedDocumentBySlug(params.slug)
  const matches = document !== null && document.type === typeForSegment(segment)

  const title = matches ? pickLocale(document, 'title', locale) : 'Knowledge Base'
  const summary = matches ? pickLocale(document, 'summary', locale) : ''
  const code = matches ? document.documentCode : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          // Warna literal: berkas ini dirender di luar Tailwind, jadi token
          // CSS variable tidak tersedia sama sekali di sini.
          background: COLORS.background,
          color: COLORS.foreground,
          padding: 64,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, color: COLORS.muted }}>
          {code ?? 'Knowledge Base'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.15 }}>
            {title.slice(0, 110)}
          </div>
          {summary ? (
            <div style={{ fontSize: 28, color: COLORS.body, lineHeight: 1.4 }}>
              {summary.slice(0, 150)}
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', fontSize: 24, color: COLORS.muted }}>
          Muhammad Sya&apos;ban Alfain — IT Support
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
