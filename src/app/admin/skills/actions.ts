'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  skillSchema,
  toFieldErrors,
  type AdminState,
} from '@/lib/schemas/admin'
import { requireAdmin } from '@/data/_guards'
import { deleteSkill, saveSkill } from '@/data/skill'

import { runAdminDelete, runAdminMutation } from '../_lib/action-helpers'

export async function saveSkillAction(
  _prevState: AdminState,
  formData: FormData,
): Promise<AdminState> {
  try {
    await requireAdmin()
  } catch {
    return {
      status: 'error',
      message: 'Sesi berakhir. Muat ulang halaman dan masuk kembali.',
    }
  }

  const parsed = skillSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  const isNew = !parsed.data.id

  const result = await runAdminMutation(async () => {
    await saveSkill(parsed.data)
    revalidateTag('skills')
  }, 'Keahlian tersimpan.')

  if (result.status === 'success' && isNew) {
    redirect('/admin/skills')
  }

  return result
}

export async function deleteSkillAction(id: string) {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Sesi berakhir.' }
  }

  return runAdminDelete(async () => {
    await deleteSkill(id)
    revalidateTag('skills')
    revalidatePath('/admin/skills')
  })
}
