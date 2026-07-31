'use client'

import type { Project } from '@prisma/client'

import { FormShell } from '@/components/admin/form-shell'
import {
  CheckboxField,
  ListField,
  StatusField,
  TextAreaField,
  TextField,
} from '@/components/admin/form-fields'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { saveProjectAction } from './actions'

export function ProjectForm({ project }: { project: Project | null }) {
  return (
    <FormShell action={saveProjectAction}>
      {(errors) => (
        <>
          {project ? (
            <input type="hidden" name="id" value={project.id} />
          ) : null}

          <TextField
            name="slug"
            label="Slug"
            required
            hint="Bagian akhir URL, mis. lab-pnetlab-kantor. Mengubahnya memutus tautan lama."
            defaultValue={project?.slug}
            error={errors.slug}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="titleId"
              label="Judul (Indonesia)"
              required
              defaultValue={project?.titleId}
              error={errors.titleId}
            />
            <TextField
              name="titleEn"
              label="Judul (Inggris)"
              hint="Boleh dikosongkan — halaman akan menampilkan versi Indonesia."
              defaultValue={project?.titleEn}
              error={errors.titleEn}
            />
          </div>

          <TextAreaField
            name="summaryId"
            label="Ringkasan (Indonesia)"
            required
            defaultValue={project?.summaryId}
            error={errors.summaryId}
          />
          <TextAreaField
            name="summaryEn"
            label="Ringkasan (Inggris)"
            defaultValue={project?.summaryEn}
            error={errors.summaryEn}
          />

          <TextField
            name="roleId"
            label="Peran Anda (Indonesia)"
            defaultValue={project?.roleId}
            error={errors.roleId}
          />
          <TextField
            name="roleEn"
            label="Peran Anda (Inggris)"
            defaultValue={project?.roleEn}
            error={errors.roleEn}
          />

          <fieldset className="space-y-6 rounded-3xl border border-border p-6">
            <legend className="px-2 text-sm font-medium">Studi kasus</legend>
            <p className="text-xs text-muted">
              Tiga blok ini yang membedakan studi kasus dari sekadar daftar
              proyek. Blok yang dikosongkan tidak dirender.
            </p>

            <TextAreaField
              name="problemId"
              label="Masalah (Indonesia)"
              rows={5}
              defaultValue={project?.problemId}
              error={errors.problemId}
            />
            <TextAreaField
              name="problemEn"
              label="Masalah (Inggris)"
              rows={5}
              defaultValue={project?.problemEn}
              error={errors.problemEn}
            />
            <TextAreaField
              name="solutionId"
              label="Solusi (Indonesia)"
              rows={5}
              defaultValue={project?.solutionId}
              error={errors.solutionId}
            />
            <TextAreaField
              name="solutionEn"
              label="Solusi (Inggris)"
              rows={5}
              defaultValue={project?.solutionEn}
              error={errors.solutionEn}
            />
            <TextAreaField
              name="resultId"
              label="Hasil (Indonesia)"
              rows={5}
              hint="Tanpa metrik yang tidak tercatat."
              defaultValue={project?.resultId}
              error={errors.resultId}
            />
            <TextAreaField
              name="resultEn"
              label="Hasil (Inggris)"
              rows={5}
              defaultValue={project?.resultEn}
              error={errors.resultEn}
            />
          </fieldset>

          <ListField
            name="tools"
            label="Teknologi & alat"
            defaultValue={project?.tools}
            error={errors.tools}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="repositoryUrl"
              label="URL repositori"
              defaultValue={project?.repositoryUrl}
              error={errors.repositoryUrl}
            />
            <TextField
              name="demoUrl"
              label="URL demo"
              defaultValue={project?.demoUrl}
              error={errors.demoUrl}
            />
          </div>

          <CheckboxField
            name="isFeatured"
            label="Tampilkan di Pekerjaan Pilihan"
            hint="Beranda menampilkan tiga proyek pilihan teratas."
            defaultChecked={project?.isFeatured}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="sortOrder"
              type="number"
              label="Urutan"
              defaultValue={String(project?.sortOrder ?? 0)}
              error={errors.sortOrder}
            />
            <StatusField
              defaultValue={(project?.status as PublishStatusValue) ?? 'DRAFT'}
              error={errors.status}
            />
          </div>
        </>
      )}
    </FormShell>
  )
}
