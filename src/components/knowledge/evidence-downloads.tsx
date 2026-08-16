import { getTranslations } from 'next-intl/server'

export type DownloadItem = {
  id: string
  href: string
  label: string
  mimeType: string
  fileSize: number
}

/**
 * Berkas pendukung yang boleh diunduh publik.
 *
 * Daftarnya datang dari relasi media yang SUDAH disaring di query
 * (`isPublic: true, redactionConfirmed: true` di `src/data/knowledge.ts`).
 * Komponen ini tidak menyaring apa pun sendiri — penyaringan di dua tempat
 * berarti dua tempat yang bisa lupa, dan yang di query adalah yang benar.
 *
 * Berkasnya sendiri tetap dilayani `/media/[...key]`, yang memeriksa ulang
 * izinnya per permintaan. Jadi tautan yang bocor pun tidak memberi akses
 * setelah berkasnya ditarik kembali dari publik.
 */
export async function EvidenceDownloads({ items }: { items: DownloadItem[] }) {
  const t = await getTranslations('knowledge.downloads')

  if (items.length === 0) return null

  return (
    <section className="mt-16" aria-labelledby="berkas-pendukung">
      <h2 id="berkas-pendukung" className="font-display text-2xl">
        {t('heading')}
      </h2>
      <p className="mt-2 text-sm text-muted">{t('note')}</p>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              download
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="min-w-0">
                <span className="block font-medium">{item.label}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {item.mimeType} ·{' '}
                  {t('size', {
                    size: Math.max(1, Math.round(item.fileSize / 1024)),
                  })}
                </span>
              </span>

              <span className="shrink-0 text-sm font-medium text-primary">
                {t('download')}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
