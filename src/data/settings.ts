import 'server-only'

import { unstable_cache } from 'next/cache'

import { prisma } from '@/lib/prisma'
import { requireAdmin, requireAdminPage } from './_guards'
import {
  narrativeSectionSchema,
  type NarrativeBlock,
  type NarrativeKey,
} from '@/lib/schemas/site-settings'

/**
 * Baca satu bagian naratif dari `SiteSetting`.
 *
 * Mengembalikan array kosong bila kuncinya belum ada ATAU isinya tidak
 * lolos validasi. Diam-diam mengembalikan kosong disengaja: bagian yang
 * datanya rusak lebih baik hilang daripada merender setengah jadi di
 * halaman publik. Kesalahan bentuk data akan terlihat di admin (Fase 3b),
 * tempat yang benar untuk memperbaikinya.
 */
export const getNarrativeSection = unstable_cache(
  async (key: NarrativeKey): Promise<NarrativeBlock[]> => {
    const row = await prisma.siteSetting.findUnique({
      where: { key },
      select: { value: true },
    })

    if (!row) return []

    const parsed = narrativeSectionSchema.safeParse(row.value)

    return parsed.success ? parsed.data : []
  },
  ['settings:narrative'],
  { tags: ['settings'] },
)

// ─── Admin ───────────────────────────────────────────────

/** Blok mentah untuk form admin; array kosong bila belum ada. */
export async function getAdminNarrative(key: NarrativeKey) {
  await requireAdminPage()

  const row = await prisma.siteSetting.findUnique({
    where: { key },
    select: { value: true },
  })

  if (!row) return []

  const parsed = narrativeSectionSchema.safeParse(row.value)

  return parsed.success ? parsed.data : []
}

export async function saveNarrative(
  key: NarrativeKey,
  blocks: NarrativeBlock[],
) {
  await requireAdmin()

  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: blocks },
    create: { key, value: blocks },
  })
}
