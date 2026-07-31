'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui'

/**
 * Tombol cetak Recruiter Mode.
 *
 * Halaman tetap bisa dicetak lewat Ctrl+P tanpa tombol ini — tombolnya
 * hanya jalan pintas, jadi tidak ada fungsi yang hilang bila JavaScript
 * mati. Tombol itu sendiri disembunyikan saat mencetak.
 */
export function PrintButton() {
  const t = useTranslations('recruiter')

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => window.print()}
      className="print:hidden"
    >
      {t('print')}
    </Button>
  )
}
