import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'

type TranslationNoticeProps = {
  locale: Locale
  /** Hanya dirender bila `true`. */
  show: boolean
}

/**
 * Banner "belum diterjemahkan" di atas isi berbahasa Indonesia yang
 * muncul di halaman `/en`.
 *
 * `role="note"` — ini informasi, bukan kondisi mendesak. `role="alert"`
 * akan menyela pembaca layar tanpa alasan.
 *
 * Lihat docs/phase-0/08_I18N_FALLBACK_POLICY.md §3.
 */
export async function TranslationNotice({
  locale,
  show,
}: TranslationNoticeProps) {
  if (!show || locale !== 'en') return null

  const t = await getTranslations('translation')

  return (
    <div
      role="note"
      className="rounded-2xl border border-border bg-elevated px-5 py-4 text-sm text-muted"
    >
      {t('pending')}
    </div>
  )
}
