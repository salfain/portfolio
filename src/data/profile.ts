import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import type { ProfileInput } from '@/lib/schemas/admin'

import { requireAdmin, requireAdminPage } from './_guards'

/**
 * `SiteProfile` tidak punya kolom `status` — hanya ada satu baris,
 * dikelola dari `/admin/profile`. Yang perlu dijaga di sini adalah
 * kolom mana yang boleh keluar ke rute publik.
 *
 * `phone` dan `whatsapp` SENGAJA tidak ikut di `publicProfileSelect`.
 * Q10 (06_OPEN_QUESTIONS) belum dijawab, jadi default paling aman
 * adalah tidak menerbitkannya. Halaman Recruiter Mode memakai
 * `recruiterProfileSelect` yang memuatnya.
 */
const baseProfileSelect = {
  name: true,
  roleId: true,
  roleEn: true,
  headlineId: true,
  headlineEn: true,
  summaryId: true,
  summaryEn: true,
  location: true,
  availabilityId: true,
  availabilityEn: true,
  profileImageUrl: true,
  cvIdUrl: true,
  cvEnUrl: true,
  githubUrl: true,
  linkedinUrl: true,
} satisfies Prisma.SiteProfileSelect

const publicProfileSelect = baseProfileSelect

const recruiterProfileSelect = {
  ...baseProfileSelect,
  email: true,
  phone: true,
  whatsapp: true,
} satisfies Prisma.SiteProfileSelect

export type PublicProfile = Prisma.SiteProfileGetPayload<{
  select: typeof publicProfileSelect
}>

export type RecruiterProfile = Prisma.SiteProfileGetPayload<{
  select: typeof recruiterProfileSelect
}>

/** Field wajib EN untuk `SiteProfile` (08_I18N_FALLBACK_POLICY §2). */
export const PROFILE_REQUIRED_EN = ['role', 'headline', 'summary'] as const

/**
 * Profil publik. `null` bila pemilik belum mengisinya lewat admin —
 * halaman pemanggil wajib menangani kondisi itu, bukan mengarang isi.
 */
export const getPublishedProfile = unstable_cache(
  async (): Promise<PublicProfile | null> =>
    prisma.siteProfile.findFirst({
      select: publicProfileSelect,
      orderBy: { createdAt: 'asc' },
    }),
  ['profile:public'],
  { tags: ['profile'] },
)

/**
 * Versi untuk Recruiter Mode — memuat kontak langsung.
 * Hanya dipakai di `/[locale]/recruiter`.
 */
export const getRecruiterProfile = unstable_cache(
  async (): Promise<RecruiterProfile | null> =>
    prisma.siteProfile.findFirst({
      select: recruiterProfileSelect,
      orderBy: { createdAt: 'asc' },
    }),
  ['profile:recruiter'],
  { tags: ['profile'] },
)

// ─── Admin ───────────────────────────────────────────────

/**
 * Profil lengkap untuk form admin — semua kolom, tanpa penyaringan.
 * Guard dipanggil DI DALAM, bukan diserahkan ke pemanggil
 * (07_DATA_PRISMA §2).
 */
export async function getAdminProfile() {
  await requireAdminPage()

  return prisma.siteProfile.findFirst({ orderBy: { createdAt: 'asc' } })
}

/**
 * Simpan profil. Hanya ada satu baris: baris pertama diperbarui, atau
 * dibuat bila belum ada. `SiteProfile` tidak punya kolom unik alami,
 * jadi upsert dilakukan lewat id baris yang sudah ada.
 */
export async function saveProfile(input: ProfileInput) {
  await requireAdmin()

  const existing = await prisma.siteProfile.findFirst({
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  })

  if (existing) {
    await prisma.siteProfile.update({ where: { id: existing.id }, data: input })
    return
  }

  await prisma.siteProfile.create({ data: input })
}
