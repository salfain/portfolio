'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

import { toFieldErrors, type AdminState } from '@/lib/schemas/admin'
import {
  mediaUpdateSchema,
  mediaUploadSchema,
} from '@/lib/schemas/media'
import { MAX_UPLOAD_BYTES } from '@/lib/media-file'
import { requireAdmin } from '@/data/_guards'
import {
  deleteDocumentMedia,
  updateDocumentMedia,
  uploadDocumentMedia,
  type UploadRejection,
} from '@/data/media'

import { runAdminDelete, runAdminMutation } from '../../../_lib/action-helpers'

const SESSION_ENDED: AdminState = {
  status: 'error',
  message: 'Sesi berakhir. Muat ulang halaman dan masuk kembali.',
}

/**
 * Alasan penolakan berkas disebutkan apa adanya.
 *
 * "Gagal mengunggah" untuk berkas 12 MB membuat orang mencoba berkas yang
 * sama berulang kali. Yang ditolak di sini bukan kegagalan tak terduga —
 * semuanya keputusan yang disengaja, dan alasannya aman diketahui.
 */
const UPLOAD_MESSAGE: Record<UploadRejection, string> = {
  FILE_MISSING: 'Pilih berkas yang akan diunggah.',
  FILE_TOO_LARGE: `Ukuran berkas melebihi ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
  FILE_TYPE_NOT_ALLOWED:
    'Jenis berkas tidak didukung. Yang diterima: PNG, JPEG, WebP, GIF, PDF, teks, dan ZIP.',
  FILE_TYPE_MISMATCH:
    'Isi berkas tidak cocok dengan jenis yang dilaporkan peramban. Berkas ditolak.',
}

function refresh(documentId: string) {
  revalidateTag('knowledge')
  revalidatePath(`/admin/knowledge/${documentId}/media`)
}

export async function uploadMediaAction(
  _prevState: AdminState,
  formData: FormData,
): Promise<AdminState> {
  try {
    await requireAdmin()
  } catch {
    return SESSION_ENDED
  }

  const parsed = mediaUploadSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  const file = formData.get('file')

  try {
    const result = await uploadDocumentMedia(
      parsed.data,
      file instanceof File ? file : null,
    )

    // Penolakan yang disengaja dikembalikan sebagai nilai, bukan lemparan —
    // supaya alasannya sampai ke pengguna tanpa melewati penanganan galat
    // yang memang tugasnya menyembunyikan isi galat tak terduga.
    if (result.error) {
      return { status: 'error', message: UPLOAD_MESSAGE[result.error] }
    }

    refresh(parsed.data.documentId)

    return {
      status: 'success',
      message: 'Bukti terunggah. Statusnya privat sampai kamu menerbitkannya.',
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return SESSION_ENDED
    }

    console.error('Unggah bukti gagal:', (error as Error)?.name)

    return { status: 'error', message: 'Gagal mengunggah. Coba lagi.' }
  }
}

export async function updateMediaAction(
  _prevState: AdminState,
  formData: FormData,
): Promise<AdminState> {
  try {
    await requireAdmin()
  } catch {
    return SESSION_ENDED
  }

  const parsed = mediaUpdateSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  const documentId = String(formData.get('documentId') ?? '')

  return runAdminMutation(async () => {
    await updateDocumentMedia(parsed.data)
    refresh(documentId)
  }, 'Bukti diperbarui.')
}

export async function deleteMediaAction(id: string) {
  return runAdminDelete(async () => {
    await deleteDocumentMedia(id)
    revalidateTag('knowledge')
    revalidatePath('/admin/knowledge')
  })
}
