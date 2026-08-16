import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderDocumentOgImage,
} from '@/lib/og/document-image'

// Implementasinya dibagi bersama tiga rute detail lain; lihat komentar di
// src/lib/og/document-image.tsx.
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Knowledge Base'

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  return renderDocumentOgImage('articles', await params)
}
