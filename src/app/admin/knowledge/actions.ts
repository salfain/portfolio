'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import type { ZodError } from 'zod'

import {
  knowledgeDocumentSchema,
  toFieldErrors,
  type AdminState,
} from '@/lib/schemas/admin'
import { metadataFromForm } from '@/lib/schemas/knowledge-metadata'
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

  const parsed = knowledgeDocumentSchema.safeParse(Object.fromEntries(formData))

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

  /**
   * Metadata terstruktur dirakit terpisah karena bentuknya bergantung pada
   * tipe dokumen — lab punya tabel perangkat, insiden punya kronologi.
   * Menggabungkannya ke satu skema datar berarti setiap field dari tiga
   * tipe lain ikut opsional di semuanya, dan `isLabReproduction` yang wajib
   * pada insiden jadi tidak bisa diwajibkan sama sekali.
   */
  const metadata = metadataFromForm(
    parsed.data.type,
    Object.fromEntries(
      Array.from(formData.entries())
        .filter(([key]) => key.startsWith('meta'))
        .map(([key, value]) => [key, String(value)]),
    ),
  )

  if (!metadata.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian khusus tipe dokumen ini.',
      fieldErrors: metadataFieldErrors(metadata.error),
    }
  }

  const isNew = !parsed.data.id

  const result = await runAdminMutation(async () => {
    await saveDocument(parsed.data, metadata.data)
    revalidateKnowledge()
  }, 'Dokumen tersimpan.')

  if (result.status === 'success' && isNew) {
    redirect('/admin/knowledge')
  }

  return result
}

/**
 * Petakan galat metadata ke nama field di form.
 *
 * Skema memakai nama tanpa awalan (`isLabReproduction`), sedangkan input di
 * form memakai awalan `meta` supaya bisa dipisahkan dari field dokumen.
 * Tanpa pemetaan ini, pesan galatnya sampai ke server tapi tidak pernah
 * muncul di sebelah isian yang salah.
 */
function metadataFieldErrors(error: ZodError): Record<string, string> {
  const mapped: Record<string, string> = {}

  for (const [field, message] of Object.entries(toFieldErrors(error))) {
    const name = `meta${field.charAt(0).toUpperCase()}${field.slice(1)}`

    mapped[name] = message
  }

  return mapped
}

export async function deleteDocumentAction(id: string) {
  return runAdminDelete(async () => {
    await deleteDocument(id)
    revalidateKnowledge()
  })
}
