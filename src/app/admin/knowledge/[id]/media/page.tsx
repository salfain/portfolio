import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getAdminDocumentById } from '@/data/knowledge-admin'
import { getDocumentMedia } from '@/data/media'
import { MEDIA_KIND_LABEL, type MediaKindValue } from '@/lib/schemas/media'

import { EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'

import { MediaEditForm, MediaUploadForm } from './media-manager'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DocumentMediaPage({ params }: PageProps) {
  const { id } = await params

  const document = await getAdminDocumentById(id)

  if (!document) notFound()

  const media = await getDocumentMedia(id)

  return (
    <AdminShell
      title="Bukti"
      description={document.titleId}
      action={
        <Link
          href={`/admin/knowledge/${id}`}
          className="rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Kembali menyunting
        </Link>
      }
    >
      <section className="max-w-2xl">
        <h2 className="text-xl font-medium">Unggah bukti</h2>
        <div className="mt-4">
          <MediaUploadForm documentId={id} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-medium">Bukti pada dokumen ini</h2>

        {media.length === 0 ? (
          <div className="mt-4 max-w-2xl">
            <EmptyState
              title="Belum ada bukti"
              description="Tangkapan layar, diagram, dan keluaran terminal diunggah di sini."
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-10">
            {media.map((asset) => (
              <li
                key={asset.id}
                className="rounded-3xl border border-border bg-surface p-6"
              >
                <div className="flex flex-wrap items-start gap-6">
                  <MediaPreview
                    src={asset.fileUrl}
                    alt={asset.altId}
                    mimeType={asset.mimeType}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-elevated px-2.5 py-0.5 text-xs text-muted">
                        {MEDIA_KIND_LABEL[asset.kind as MediaKindValue]}
                      </span>

                      {asset.isPublic && asset.redactionConfirmed ? (
                        <span className="rounded-full bg-success px-2.5 py-0.5 text-xs font-medium text-white">
                          Publik
                        </span>
                      ) : (
                        <span className="rounded-full bg-elevated px-2.5 py-0.5 text-xs text-muted">
                          Privat
                        </span>
                      )}

                      {asset.isCover ? (
                        <span className="rounded-full bg-elevated px-2.5 py-0.5 text-xs text-muted">
                          Sampul
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 break-all text-xs text-muted">
                      {asset.mimeType} · {Math.round(asset.fileSize / 1024)} kB
                      {asset.width && asset.height
                        ? ` · ${asset.width}×${asset.height}`
                        : ' · dimensi tidak terbaca'}
                    </p>

                    <p className="mt-1 break-all text-xs text-muted">
                      {asset.fileUrl}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <MediaEditForm asset={asset} documentId={id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  )
}

/**
 * Pratinjau di admin memakai `<img>`, bukan `next/image` — disengaja.
 *
 * Aset privat hanya bisa diambil dengan cookie sesi admin, sementara
 * pengoptimal gambar Next.js mengambil sumbernya dari sisi server tanpa
 * membawa cookie itu. Hasilnya 404 di setiap bukti yang belum terbit —
 * yaitu justru semua yang sedang diperiksa di halaman ini.
 *
 * Halaman publik tidak punya masalah ini: yang tampil di sana hanya aset
 * yang sudah publik.
 */
function MediaPreview({
  src,
  alt,
  mimeType,
}: {
  src: string
  alt: string
  mimeType: string
}) {
  if (!mimeType.startsWith('image/')) {
    return (
      <div className="grid h-32 w-32 shrink-0 place-items-center rounded-2xl bg-elevated text-xs text-muted">
        {mimeType.split('/')[1]?.toUpperCase()}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- lihat komentar di atas
    <img
      src={src}
      alt={alt}
      className="h-32 w-32 shrink-0 rounded-2xl object-cover"
    />
  )
}
