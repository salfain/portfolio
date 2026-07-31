'use client'

import type { SiteProfile } from '@prisma/client'

import { FormShell } from '@/components/admin/form-shell'
import { TextAreaField, TextField } from '@/components/admin/form-fields'

import { saveProfileAction } from './actions'

export function ProfileForm({ profile }: { profile: SiteProfile | null }) {
  return (
    <FormShell action={saveProfileAction}>
      {(errors) => (
        <>
          <TextField
            name="name"
            label="Nama lengkap"
            required
            defaultValue={profile?.name}
            error={errors.name}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="roleId"
              label="Peran (Indonesia)"
              required
              defaultValue={profile?.roleId}
              error={errors.roleId}
            />
            <TextField
              name="roleEn"
              label="Peran (Inggris)"
              required
              defaultValue={profile?.roleEn}
              error={errors.roleEn}
            />
          </div>

          <TextAreaField
            name="headlineId"
            label="Headline (Indonesia)"
            required
            rows={2}
            hint="Kalimat utama di hero. Tanpa angka atau klaim yang tidak bisa dibuktikan."
            defaultValue={profile?.headlineId}
            error={errors.headlineId}
          />
          <TextAreaField
            name="headlineEn"
            label="Headline (Inggris)"
            required
            rows={2}
            defaultValue={profile?.headlineEn}
            error={errors.headlineEn}
          />

          <TextAreaField
            name="summaryId"
            label="Ringkasan (Indonesia)"
            required
            rows={5}
            defaultValue={profile?.summaryId}
            error={errors.summaryId}
          />
          <TextAreaField
            name="summaryEn"
            label="Ringkasan (Inggris)"
            required
            rows={5}
            defaultValue={profile?.summaryEn}
            error={errors.summaryEn}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="availabilityId"
              label="Badge ketersediaan (Indonesia)"
              hint="Kosongkan bila tidak ingin menampilkan badge."
              defaultValue={profile?.availabilityId}
              error={errors.availabilityId}
            />
            <TextField
              name="availabilityEn"
              label="Badge ketersediaan (Inggris)"
              defaultValue={profile?.availabilityEn}
              error={errors.availabilityEn}
            />
          </div>

          <TextField
            name="location"
            label="Lokasi"
            defaultValue={profile?.location}
            error={errors.location}
          />

          <fieldset className="space-y-6 rounded-3xl border border-border p-6">
            <legend className="px-2 text-sm font-medium">
              Kontak — hanya tampil di halaman Recruiter Mode
            </legend>
            <p className="text-xs text-muted">
              Halaman Recruiter Mode ber-<code>noindex</code>, jadi alamat di
              sini tidak ikut terpanen dari hasil pencarian. Halaman Kontak
              publik tetap memakai form.
            </p>

            <TextField
              name="email"
              type="email"
              label="Email"
              required
              defaultValue={profile?.email}
              error={errors.email}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                name="phone"
                label="Telepon"
                defaultValue={profile?.phone}
                error={errors.phone}
              />
              <TextField
                name="whatsapp"
                label="WhatsApp"
                defaultValue={profile?.whatsapp}
                error={errors.whatsapp}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-6 rounded-3xl border border-border p-6">
            <legend className="px-2 text-sm font-medium">Berkas & tautan</legend>
            <p className="text-xs text-muted">
              Sampai penyimpanan objek dipasang di Fase 5, isi dengan path
              berkas lokal di folder <code>public/</code>, mis.{' '}
              <code>/cv/cv-id.pdf</code>. Tombol Unduh CV hanya muncul bila
              terisi.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                name="cvIdUrl"
                label="Berkas CV (Indonesia)"
                defaultValue={profile?.cvIdUrl}
                error={errors.cvIdUrl}
              />
              <TextField
                name="cvEnUrl"
                label="Berkas CV (Inggris)"
                defaultValue={profile?.cvEnUrl}
                error={errors.cvEnUrl}
              />
            </div>

            <TextField
              name="profileImageUrl"
              label="Foto profil"
              hint="Path berkas, mis. /foto/profil.jpg. Kosongkan bila belum ada."
              defaultValue={profile?.profileImageUrl}
              error={errors.profileImageUrl}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                name="linkedinUrl"
                label="URL LinkedIn"
                defaultValue={profile?.linkedinUrl}
                error={errors.linkedinUrl}
              />
              <TextField
                name="githubUrl"
                label="URL GitHub"
                defaultValue={profile?.githubUrl}
                error={errors.githubUrl}
              />
            </div>
          </fieldset>
        </>
      )}
    </FormShell>
  )
}
