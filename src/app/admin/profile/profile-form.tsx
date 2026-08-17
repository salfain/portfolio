'use client'

import type { SiteProfile } from '@prisma/client'

import { FormShell } from '@/components/admin/form-shell'
import { TextAreaField, TextField } from '@/components/admin/form-fields'

import { saveProfileAction } from './actions'
import { ProfileAssetUpload } from './profile-asset-upload'

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
            <legend className="px-2 text-sm font-medium">
              Berkas & tautan
            </legend>
            <p className="text-xs text-muted">
              Berkas diunggah langsung ke penyimpanan dan tersimpan begitu
              terpilih, terpisah dari tombol Simpan di bawah. Tombol Unduh CV di
              situs hanya muncul bila berkasnya ada.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              <ProfileAssetUpload
                kind="cvId"
                label="Berkas CV (Indonesia)"
                currentUrl={profile?.cvIdUrl}
                disabled={!profile}
              />
              <ProfileAssetUpload
                kind="cvEn"
                label="Berkas CV (Inggris)"
                currentUrl={profile?.cvEnUrl}
                disabled={!profile}
              />
            </div>

            <ProfileAssetUpload
              kind="photo"
              label="Foto profil"
              currentUrl={profile?.profileImageUrl}
              disabled={!profile}
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
