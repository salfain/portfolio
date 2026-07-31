import 'server-only'

import { prisma } from '@/lib/prisma'

import { requireAdmin, requireAdminPage } from './_guards'
import type { ContactInput } from '@/lib/schemas/contact'

/**
 * Simpan pesan dari form kontak publik.
 *
 * Tidak di-cache dan tidak punya varian `getPublished*` — pesan kontak
 * tidak pernah dibaca dari rute publik. Pembacaannya (`getAdminMessages`)
 * dikerjakan di Fase 3b bersama `/admin/messages`.
 */
export async function createContactMessage(
  input: Omit<ContactInput, 'website'>,
): Promise<void> {
  await prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      company: input.company || null,
      subject: input.subject || null,
      message: input.message,
      locale: input.locale,
    },
  })
}

/**
 * Pembatas laju sederhana: hitung pesan dari email yang sama dalam
 * satu jam terakhir. Bukan pengganti rate limit di tepi jaringan
 * (Fase 8), tapi cukup menahan pengiriman berulang dari satu form.
 */
export async function countRecentMessagesFrom(
  email: string,
  withinMinutes = 60,
): Promise<number> {
  const since = new Date(Date.now() - withinMinutes * 60 * 1000)

  return prisma.contactMessage.count({
    where: { email, createdAt: { gte: since } },
  })
}

// ─── Admin ───────────────────────────────────────────────

export async function getAdminMessages() {
  await requireAdminPage()

  return prisma.contactMessage.findMany({
    orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
    take: 200,
  })
}

export async function countUnreadMessages() {
  await requireAdminPage()

  return prisma.contactMessage.count({ where: { isRead: false } })
}

export async function setMessageRead(id: string, isRead: boolean) {
  await requireAdmin()

  await prisma.contactMessage.update({ where: { id }, data: { isRead } })
}

export async function deleteContactMessage(id: string) {
  await requireAdmin()

  await prisma.contactMessage.delete({ where: { id } })
}
