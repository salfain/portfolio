'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  experienceSchema,
  toFieldErrors,
  type AdminState,
} from '@/lib/schemas/admin'
import { requireAdmin } from '@/data/_guards'
import { deleteExperience, saveExperience } from '@/data/experience'

import { runAdminDelete, runAdminMutation } from '../_lib/action-helpers'

export async function saveExperienceAction(
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

  const parsed = experienceSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  const isNew = !parsed.data.id

  const result = await runAdminMutation(async () => {
    await saveExperience(parsed.data)
    updateTag('experience')
  }, 'Pengalaman tersimpan.')

  // Entri baru: kembali ke daftar supaya tidak tersimpan dua kali kalau
  // tombol ditekan lagi. `redirect` melempar, jadi harus di luar try.
  if (result.status === 'success' && isNew) {
    redirect('/admin/experiences')
  }

  return result
}

export async function deleteExperienceAction(id: string) {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Sesi berakhir.' }
  }

  return runAdminDelete(async () => {
    await deleteExperience(id)
    updateTag('experience')
    // Menyegarkan cache router klien; tanpa ini baris yang dihapus
    // masih terlihat sampai halaman dimuat ulang penuh.
    revalidatePath('/admin/experiences')
  })
}
