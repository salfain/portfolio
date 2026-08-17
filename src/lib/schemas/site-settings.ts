import { z } from 'zod'

/**
 * Bagian naratif homepage ("Kenapa Bekerja dengan Saya" dan
 * "Cara Saya Menangani Masalah") berisi klaim tentang cara kerja
 * pemilik. Isinya TIDAK boleh ditulis di kode — harus datang dari
 * pemilik lewat `SiteSetting`, dikelola di Fase 3b.
 *
 * Selama baris settingnya belum ada, bagiannya tidak dirender sama
 * sekali (bukan kotak kosong). Lihat CLAUDE.md aturan mutlak §1.
 */
export const narrativeBlockSchema = z.object({
  titleId: z.string().trim().min(1),
  titleEn: z.string().trim().nullish(),
  bodyId: z.string().trim().min(1),
  bodyEn: z.string().trim().nullish(),
})

export const narrativeSectionSchema = z.array(narrativeBlockSchema)

export type NarrativeBlock = z.infer<typeof narrativeBlockSchema>

/** Kunci `SiteSetting` yang dikenali. Sengaja tertutup, bukan string bebas. */
export const NARRATIVE_KEYS = {
  whyWorkWithMe: 'home.whyWorkWithMe',
  troubleshootingProcess: 'home.troubleshootingProcess',
  aboutStory: 'about.story',
  aboutHowIWork: 'about.howIWork',
  aboutBeyondWork: 'about.beyondWork',
} as const

export type NarrativeKey = (typeof NARRATIVE_KEYS)[keyof typeof NARRATIVE_KEYS]
