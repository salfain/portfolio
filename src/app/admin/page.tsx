import Link from 'next/link'

import { cn } from '@/lib/cn'
import { getAdminProjects } from '@/data/project'
import { getAdminExperiences } from '@/data/experience'
import { getAdminSkills } from '@/data/skill'
import { getAdminCertificates } from '@/data/certificate'
import { getAdminProfile } from '@/data/profile'
import { countUnreadMessages } from '@/data/contact'

import { AdminShell } from '@/components/admin/admin-shell'

// Dasbor selalu menampilkan angka terkini; tidak boleh dari cache.
export const dynamic = 'force-dynamic'

type Summary = {
  label: string
  href: string
  total: number
  published: number | null
}

export default async function AdminPage() {
  // AdminShell memeriksa sesi; fungsi getAdmin* memanggil requireAdmin()
  // masing-masing, jadi tidak ada jalur yang lolos tanpa pemeriksaan.
  const [profile, projects, experiences, skills, certificates, unread] =
    await Promise.all([
      getAdminProfile(),
      getAdminProjects(),
      getAdminExperiences(),
      getAdminSkills(),
      getAdminCertificates(),
      countUnreadMessages(),
    ])

  const countPublished = <T extends { status: string }>(rows: T[]) =>
    rows.filter((row) => row.status === 'PUBLISHED').length

  const summaries: Summary[] = [
    {
      label: 'Proyek',
      href: '/admin/projects',
      total: projects.length,
      published: countPublished(projects),
    },
    {
      label: 'Pengalaman',
      href: '/admin/experiences',
      total: experiences.length,
      published: countPublished(experiences),
    },
    {
      label: 'Keahlian',
      href: '/admin/skills',
      total: skills.length,
      published: countPublished(skills),
    },
    {
      label: 'Sertifikat',
      href: '/admin/certifications',
      total: certificates.length,
      published: countPublished(certificates),
    },
    {
      label: 'Pesan belum dibaca',
      href: '/admin/messages',
      total: unread,
      published: null,
    },
  ]

  return (
    <AdminShell
      title="Dasbor Admin"
      description="Ringkasan isi situs. Hanya entri berstatus Terbit yang tampil di halaman publik."
    >
      {!profile ? (
        <div className="mb-6 rounded-2xl border border-warning/40 bg-warning/10 px-5 py-4 text-sm">
          Profil situs belum diisi. Hero, Recruiter Mode, dan tombol Unduh CV
          tetap kosong sampai diisi.{' '}
          <Link href="/admin/profile" className="font-medium underline">
            Isi profil sekarang
          </Link>
          .
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaries.map((summary) => (
          <Link
            key={summary.href}
            href={summary.href}
            className={cn(
              'rounded-3xl border border-border bg-surface p-7 transition-colors',
              'hover:border-[var(--accent-line)]',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
            )}
          >
            {/* Angka serif besar dulu, label mono di bawahnya: dasbor ini
                dibaca sekilas, dan yang dicari selalu angkanya. */}
            <p className="font-display text-4xl tabular-nums leading-none">
              {summary.total}
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              {summary.label}
            </p>
            {summary.published !== null ? (
              <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
                {summary.published} terbit
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </AdminShell>
  )
}
