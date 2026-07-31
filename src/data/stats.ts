import 'server-only'

import { unstable_cache } from 'next/cache'

import { prisma } from '@/lib/prisma'

/**
 * Angka untuk bagian "Ringkasan / At a Glance".
 *
 * SEMUANYA dihitung dari database. Tidak ada metrik yang diketik
 * manual — lama pengalaman, jumlah tiket, jumlah pengguna, dan
 * rata-rata waktu penyelesaian butuh catatan nyata yang belum ada
 * (00_CONTENT_INVENTORY §10, 06_OPEN_QUESTIONS Q6).
 *
 * Kartu bernilai 0 disembunyikan di komponen, sehingga bagian ini
 * tetap rapi dengan tiga kartu maupun enam.
 */
export type CareerStats = {
  projects: number
  sops: number
  labs: number
  incidents: number
  certificates: number
}

export const getCareerStats = unstable_cache(
  async (): Promise<CareerStats> => {
    const [projects, sops, labs, incidents, certificates] = await Promise.all([
      prisma.project.count({ where: { status: 'PUBLISHED' } }),
      prisma.knowledgeDocument.count({
        where: { status: 'PUBLISHED', type: 'SOP' },
      }),
      prisma.knowledgeDocument.count({
        where: { status: 'PUBLISHED', type: 'LAB' },
      }),
      prisma.knowledgeDocument.count({
        where: { status: 'PUBLISHED', type: 'INCIDENT' },
      }),
      prisma.certificate.count({ where: { status: 'PUBLISHED' } }),
    ])

    return { projects, sops, labs, incidents, certificates }
  },
  ['stats:career'],
  { tags: ['projects', 'knowledge', 'certificates'] },
)
