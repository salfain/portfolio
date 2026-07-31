import type { NarrativeBlock } from '@/lib/schemas/site-settings'

/**
 * Format teks bagian naratif.
 *
 * Sengaja ditaruh di modul terpisah, bukan di dalam berkas `'use server'`:
 * berkas server action hanya boleh mengekspor fungsi async, jadi helper
 * murni di sana tidak bisa diekspor — dan yang tidak bisa diekspor tidak
 * bisa diuji.
 *
 * Bentuknya:
 *
 *   Judul blok | Isi blok
 *
 *   Judul lain | Isi lain
 *
 * Satu blok per paragraf (dipisah baris kosong), judul dan isi dipisah
 * tanda `|` PERTAMA. Isi boleh memuat `|` lain.
 */
export type ParsedBlock = { title: string; body: string }

export function parseNarrativeText(text: string): ParsedBlock[] {
  return text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const separator = chunk.indexOf('|')

      if (separator === -1) return { title: '', body: chunk }

      return {
        title: chunk.slice(0, separator).trim(),
        // Baris tunggal di dalam satu blok disatukan; pemisah antar-blok
        // adalah baris kosong, bukan baris baru biasa.
        body: chunk
          .slice(separator + 1)
          .trim()
          .replace(/\s*\n\s*/g, ' '),
      }
    })
    // Blok setengah jadi dibuang: judul tanpa isi (atau sebaliknya) akan
    // merender kartu kosong di halaman depan.
    .filter((block) => block.title !== '' && block.body !== '')
}

/** Kebalikannya — blok tersimpan menjadi teks untuk textarea admin. */
export function toNarrativeText(
  blocks: NarrativeBlock[],
  locale: 'id' | 'en',
): string {
  return blocks
    .map((block) => {
      const title = locale === 'id' ? block.titleId : block.titleEn
      const body = locale === 'id' ? block.bodyId : block.bodyEn

      if (!title || !body) return null

      return `${title} | ${body}`
    })
    .filter((line): line is string => line !== null)
    .join('\n\n')
}

/**
 * Pasangkan blok Indonesia dengan Inggris berdasarkan urutan.
 *
 * Indonesia adalah sumber kebenaran; Inggris boleh kosong seluruhnya,
 * tapi tidak boleh separuh — jumlah yang tidak sama hampir selalu berarti
 * salah satu blok terlewat saat menerjemahkan, dan memasangkannya
 * berdasarkan urutan akan menempelkan terjemahan ke blok yang keliru.
 */
export function pairNarrativeBlocks(
  idBlocks: ParsedBlock[],
  enBlocks: ParsedBlock[],
): NarrativeBlock[] {
  return idBlocks.map((block, index) => ({
    titleId: block.title,
    bodyId: block.body,
    titleEn: enBlocks[index]?.title ?? null,
    bodyEn: enBlocks[index]?.body ?? null,
  }))
}
