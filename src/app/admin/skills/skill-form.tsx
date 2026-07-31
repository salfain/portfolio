'use client'

import type { Skill } from '@prisma/client'

import { FormShell } from '@/components/admin/form-shell'
import {
  CheckboxField,
  StatusField,
  TextField,
} from '@/components/admin/form-fields'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { saveSkillAction } from './actions'

export function SkillForm({ skill }: { skill: Skill | null }) {
  return (
    <FormShell action={saveSkillAction}>
      {(errors) => (
        <>
          {skill ? <input type="hidden" name="id" value={skill.id} /> : null}

          <TextField
            name="name"
            label="Nama keahlian"
            required
            defaultValue={skill?.name}
            error={errors.name}
          />

          <TextField
            name="category"
            label="Kategori"
            required
            hint="Dipakai sebagai judul kartu di halaman Keahlian, mis. Jaringan."
            defaultValue={skill?.category}
            error={errors.category}
          />

          <TextField
            name="level"
            label="Level"
            hint="Kata, bukan persentase — mis. Dasar, Menengah, Mahir. Boleh dikosongkan."
            defaultValue={skill?.level}
            error={errors.level}
          />

          <CheckboxField
            name="isFeatured"
            label="Tandai sebagai unggulan"
            defaultChecked={skill?.isFeatured}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="sortOrder"
              type="number"
              label="Urutan dalam kategori"
              defaultValue={String(skill?.sortOrder ?? 0)}
              error={errors.sortOrder}
            />
            <StatusField
              defaultValue={(skill?.status as PublishStatusValue) ?? 'DRAFT'}
              error={errors.status}
            />
          </div>
        </>
      )}
    </FormShell>
  )
}
