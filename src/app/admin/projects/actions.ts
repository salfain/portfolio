'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  projectSchema,
  toFieldErrors,
  type AdminState,
} from '@/lib/schemas/admin'
import { requireAdmin } from '@/data/_guards'
import { deleteProject, isSlugTaken, saveProject } from '@/data/project'

import { runAdminDelete, runAdminMutation } from '../_lib/action-helpers'

export async function saveProjectAction(
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

  const parsed = projectSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  /**
   * Slug unik diperiksa di sini, bukan dibiarkan menabrak constraint
   * database. Galat P2002 dari Prisma akan muncul sebagai "Gagal
   * menyimpan" tanpa menunjuk field mana yang bentrok.
   */
  try {
    if (await isSlugTaken(parsed.data.slug, parsed.data.id)) {
      return {
        status: 'error',
        message: 'Periksa kembali isian yang ditandai.',
        fieldErrors: { slug: 'Slug ini sudah dipakai proyek lain.' },
      }
    }
  } catch {
    return {
      status: 'error',
      message: 'Sesi berakhir. Muat ulang halaman dan masuk kembali.',
    }
  }

  const isNew = !parsed.data.id

  const result = await runAdminMutation(async () => {
    await saveProject(parsed.data)
    updateTag('projects')
  }, 'Proyek tersimpan.')

  if (result.status === 'success' && isNew) {
    redirect('/admin/projects')
  }

  return result
}

export async function deleteProjectAction(id: string) {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Sesi berakhir.' }
  }

  return runAdminDelete(async () => {
    await deleteProject(id)
    updateTag('projects')
    revalidatePath('/admin/projects')
  })
}
