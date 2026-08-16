import type { Locale } from '@/i18n/routing'
import { resolveLocalized } from '@/lib/i18n-content'
import type { NarrativeBlock } from '@/lib/schemas/site-settings'

import { Card, CardBody } from '@/components/ui'
import { StaggerContainer, StaggerItem } from '@/components/motion'

import { Section } from './section'

type NarrativeProps = {
  id: string
  title: string
  description?: string
  blocks: NarrativeBlock[]
  locale: Locale
  /** Beri nomor urut pada tiap blok — dipakai bagian "Cara Saya Menangani Masalah". */
  numbered?: boolean
}

/**
 * Bagian naratif yang isinya ditulis pemilik, bukan developer.
 *
 * Dipakai oleh "Kenapa Bekerja dengan Saya" dan "Cara Saya Menangani
 * Masalah". Keduanya berisi klaim tentang cara kerja pemilik, jadi
 * teksnya wajib datang dari `SiteSetting` — tidak boleh ditulis di kode.
 *
 * Tanpa data, bagian ini TIDAK dirender sama sekali. Kotak kosong
 * bertuliskan "belum ada isi" di halaman depan lebih merugikan
 * daripada bagian yang tidak muncul.
 */
export function Narrative({
  id,
  title,
  description,
  blocks,
  locale,
  numbered = false,
}: NarrativeProps) {
  if (blocks.length === 0) return null

  return (
    <Section id={id} title={title} description={description}>
      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block, index) => {
          const blockTitle = resolveLocalized(block, 'title', locale)
          const blockBody = resolveLocalized(block, 'body', locale)

          return (
            <StaggerItem key={`${id}-${index}`}>
              <Card className="h-full">
                <CardBody>
                  {numbered ? (
                    <span
                      aria-hidden
                      className="text-sm font-medium text-primary"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  ) : null}

                  <h3
                    lang={blockTitle.lang}
                    className="mt-2 text-base font-medium"
                  >
                    {blockTitle.value}
                  </h3>

                  <p
                    lang={blockBody.lang}
                    className="mt-2 hyphens-auto text-justify text-sm leading-relaxed text-muted"
                  >
                    {blockBody.value}
                  </p>
                </CardBody>
              </Card>
            </StaggerItem>
          )
        })}
      </StaggerContainer>
    </Section>
  )
}
