'use server'

import { revalidatePath, updateTag } from 'next/cache'

import { toFieldErrors, type AdminState } from '@/lib/schemas/admin'
import { categorySchema } from '@/lib/schemas/knowledge-admin'
import { requireAdmin } from '@/data/_guards'
import { deleteCategory, saveCategory } from '@/data/knowledge'

import { runAdminDelete, runAdminMutation } from '../_lib/action-helpers'

export async function saveCategoryAction(
  _prevState: AdminState,
  formData: FormData,
): Promise<AdminState> {
  try {
    await requireAdmin()
  } catch {
    return { status: 'error', message: 'Sesi berakhir. Masuk kembali.' }
  }

  const parsed = categorySchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  return runAdminMutation(async () => {
    await saveCategory(parsed.data)
    updateTag('knowledge')
    revalidatePath('/admin/categories')
  }, 'Kategori tersimpan.')
}

export async function deleteCategoryAction(id: string) {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Sesi berakhir.' }
  }

  try {
    await deleteCategory(id)
    updateTag('knowledge')
    revalidatePath('/admin/categories')

    return {}
  } catch (error) {
    // Pesan khusus: "gagal menghapus" saja tidak memberi tahu pengguna
    // bahwa mereka cukup memindahkan dokumennya lebih dulu.
    if (error instanceof Error && error.message === 'CATEGORY_IN_USE') {
      return { error: 'Masih dipakai dokumen atau proyek.' }
    }

    return runAdminDelete(async () => {
      throw error
    })
  }
}
