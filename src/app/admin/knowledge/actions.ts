'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { toFieldErrors, type AdminState } from '@/lib/schemas/admin'
import { knowledgeDocumentSchema } from '@/lib/schemas/knowledge-admin'
import { requireAdmin } from '@/data/_guards'
import {
  deleteDocument,
  isDocumentSlugTaken,
  saveDocument,
} from '@/data/knowledge'

import { runAdminDelete, runAdminMutation } from '../_lib/action-helpers'

export async function saveDocumentAction(
  _prevState: AdminState,
  formData: FormData,
): Promise<AdminState> {
  let session

  try {
    session = await requireAdmin()
  } catch {
    return {
      status: 'error',
      message: 'Sesi berakhir. Muat ulang halaman dan masuk kembali.',
    }
  }

  const parsed = knowledgeDocumentSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  // Slug diperiksa di sini supaya bentroknya menunjuk field yang benar,
  // bukan muncul sebagai galat P2002 yang tidak bisa dibaca pengguna.
  if (await isDocumentSlugTaken(parsed.data.slug, parsed.data.id)) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: { slug: 'Slug ini sudah dipakai dokumen lain.' },
    }
  }

  const isNew = !parsed.data.id

  const result = await runAdminMutation(async () => {
    await saveDocument(parsed.data, session.user.id)

    revalidateTag('knowledge')
    revalidatePath('/admin/knowledge')
  }, 'Dokumen tersimpan.')

  if (result.status === 'success' && isNew) {
    redirect('/admin/knowledge')
  }

  return result
}

export async function deleteDocumentAction(id: string) {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Sesi berakhir.' }
  }

  return runAdminDelete(async () => {
    await deleteDocument(id)
    revalidateTag('knowledge')
    revalidatePath('/admin/knowledge')
  })
}
