'use server'

import { revalidatePath, updateTag } from 'next/cache'

import {
  knowledgeCategorySchema,
  toFieldErrors,
  type AdminState,
} from '@/lib/schemas/admin'
import { requireAdmin } from '@/data/_guards'
import {
  deleteCategory,
  deleteTag,
  isCategorySlugTaken,
  saveCategory,
} from '@/data/knowledge-admin'

import { runAdminMutation } from '../_lib/action-helpers'

export async function saveCategoryAction(
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

  const parsed = knowledgeCategorySchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  try {
    if (await isCategorySlugTaken(parsed.data.slug, parsed.data.id)) {
      return {
        status: 'error',
        message: 'Periksa kembali isian yang ditandai.',
        fieldErrors: { slug: 'Slug ini sudah dipakai kategori lain.' },
      }
    }
  } catch {
    return {
      status: 'error',
      message: 'Sesi berakhir. Muat ulang halaman dan masuk kembali.',
    }
  }

  return runAdminMutation(async () => {
    await saveCategory(parsed.data)
    updateTag('knowledge')
    revalidatePath('/admin/taxonomy')
  }, 'Kategori tersimpan.')
}

/**
 * Penolakan "masih dipakai" dibedakan dari kegagalan biasa.
 *
 * `runAdminDelete` sengaja meratakan semua galat menjadi satu pesan supaya
 * isi galat Prisma tidak bocor ke klien. Tapi "kategori ini masih menempel
 * di dokumen" bukan kegagalan tak terduga — itu keputusan yang disengaja,
 * dan alasannya justru yang paling perlu diketahui pemiliknya. Tanpa itu
 * ia akan menekan Hapus berulang kali.
 */
async function deleteWithReason(
  mutate: () => Promise<void>,
  reasons: Record<string, string>,
): Promise<{ error?: string }> {
  try {
    await mutate()

    return {}
  } catch (error) {
    const code = error instanceof Error ? error.message : ''

    if (code === 'UNAUTHORIZED') return { error: 'Sesi berakhir.' }
    if (reasons[code]) return { error: reasons[code] }

    // Sama seperti `runAdminDelete`: isi galat tidak pernah diteruskan ke
    // klien — pesan Prisma bisa memuat nama kolom dan potongan query.
    console.error('Hapus taksonomi gagal:', (error as Error)?.name)

    return { error: 'Gagal menghapus.' }
  }
}

export async function deleteCategoryAction(id: string) {
  return deleteWithReason(
    async () => {
      await deleteCategory(id)
      updateTag('knowledge')
      revalidatePath('/admin/taxonomy')
    },
    {
      CATEGORY_IN_USE:
        'Kategori ini masih dipakai dokumen atau proyek. Pindahkan dulu isinya.',
    },
  )
}

export async function deleteTagAction(id: string) {
  return deleteWithReason(
    async () => {
      await deleteTag(id)
      updateTag('knowledge')
      revalidatePath('/admin/taxonomy')
    },
    { TAG_IN_USE: 'Tag ini masih menempel di dokumen atau proyek.' },
  )
}
