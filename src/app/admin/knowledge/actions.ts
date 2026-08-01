'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  knowledgeDocumentSchema,
  toFieldErrors,
  type AdminState,
} from '@/lib/schemas/admin'
import { requireAdmin } from '@/data/_guards'
import {
  deleteDocument,
  isDocumentCodeTaken,
  isDocumentSlugTaken,
  saveDocument,
} from '@/data/knowledge-admin'

import { runAdminDelete, runAdminMutation } from '../_lib/action-helpers'

const SESSION_ENDED: AdminState = {
  status: 'error',
  message: 'Sesi berakhir. Muat ulang halaman dan masuk kembali.',
}

/**
 * Menyegarkan seluruh permukaan publik yang menampilkan dokumen.
 *
 * `revalidateTag('knowledge')` mengurus data ber-cache. `revalidatePath`
 * untuk sitemap dan beranda, yang tidak ikut tag itu.
 *
 * Yang TIDAK perlu lagi: build ulang. Sejak `dynamicParams = true` bisa
 * dipakai (docs/phase-5/NOTES.md N1), slug yang baru terbit langsung bisa
 * dibuka tanpa menunggu deploy berikutnya.
 */
function revalidateKnowledge() {
  revalidateTag('knowledge')
  revalidatePath('/[locale]', 'page')
  revalidatePath('/sitemap.xml')
}

export async function saveDocumentAction(
  _prevState: AdminState,
  formData: FormData,
): Promise<AdminState> {
  try {
    await requireAdmin()
  } catch {
    return SESSION_ENDED
  }

  const parsed = knowledgeDocumentSchema.safeParse(
    Object.fromEntries(formData),
  )

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  // Slug dan kode dokumen diperiksa di sini, bukan dibiarkan menabrak
  // constraint database — galat P2002 dari Prisma muncul sebagai "Gagal
  // menyimpan" tanpa menunjuk field mana yang bentrok.
  try {
    if (await isDocumentSlugTaken(parsed.data.slug, parsed.data.id)) {
      return {
        status: 'error',
        message: 'Periksa kembali isian yang ditandai.',
        fieldErrors: { slug: 'Slug ini sudah dipakai dokumen lain.' },
      }
    }

    if (
      parsed.data.documentCode &&
      (await isDocumentCodeTaken(parsed.data.documentCode, parsed.data.id))
    ) {
      return {
        status: 'error',
        message: 'Periksa kembali isian yang ditandai.',
        fieldErrors: {
          documentCode: 'Kode dokumen ini sudah dipakai dokumen lain.',
        },
      }
    }
  } catch {
    return SESSION_ENDED
  }

  const isNew = !parsed.data.id

  const result = await runAdminMutation(async () => {
    await saveDocument(parsed.data)
    revalidateKnowledge()
  }, 'Dokumen tersimpan.')

  if (result.status === 'success' && isNew) {
    redirect('/admin/knowledge')
  }

  return result
}

export async function deleteDocumentAction(id: string) {
  return runAdminDelete(async () => {
    await deleteDocument(id)
    revalidateKnowledge()
  })
}
