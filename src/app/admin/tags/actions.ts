'use server'

import { revalidatePath, updateTag } from 'next/cache'

import { toFieldErrors, type AdminState } from '@/lib/schemas/admin'
import { tagSchema } from '@/lib/schemas/knowledge-admin'
import { requireAdmin } from '@/data/_guards'
import { deleteTag, saveTag } from '@/data/knowledge'

import { runAdminDelete, runAdminMutation } from '../_lib/action-helpers'

export async function saveTagAction(
  _prevState: AdminState,
  formData: FormData,
): Promise<AdminState> {
  try {
    await requireAdmin()
  } catch {
    return { status: 'error', message: 'Sesi berakhir. Masuk kembali.' }
  }

  const parsed = tagSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  return runAdminMutation(async () => {
    await saveTag(parsed.data)
    updateTag('knowledge')
    revalidatePath('/admin/tags')
  }, 'Tag tersimpan.')
}

export async function deleteTagAction(id: string) {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Sesi berakhir.' }
  }

  return runAdminDelete(async () => {
    await deleteTag(id)
    updateTag('knowledge')
    revalidatePath('/admin/tags')
  })
}
