import { getAdminProfile } from '@/data/profile'

import { AdminShell } from '@/components/admin/admin-shell'

import { ProfileForm } from './profile-form'

export const dynamic = 'force-dynamic'

export default async function AdminProfilePage() {
  const profile = await getAdminProfile()

  return (
    <AdminShell
      title="Profil Situs"
      description="Dipakai di hero, halaman Tentang, dan Recruiter Mode. Hanya ada satu profil."
    >
      <ProfileForm profile={profile} />
    </AdminShell>
  )
}
