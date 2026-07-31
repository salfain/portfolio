'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  certificateSchema,
  toFieldErrors,
  type AdminState,
} from '@/lib/schemas/admin'
import { requireAdmin } from '@/data/_guards'
import { deleteCertificate, saveCertificate } from '@/data/certificate'

import { runAdminDelete, runAdminMutation } from '../_lib/action-helpers'

export async function saveCertificateAction(
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

  const parsed = certificateSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  const isNew = !parsed.data.id

  const result = await runAdminMutation(async () => {
    await saveCertificate(parsed.data)
    revalidateTag('certificates')
  }, 'Sertifikat tersimpan.')

  if (result.status === 'success' && isNew) {
    redirect('/admin/certifications')
  }

  return result
}

export async function deleteCertificateAction(id: string) {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Sesi berakhir.' }
  }

  return runAdminDelete(async () => {
    await deleteCertificate(id)
    revalidateTag('certificates')
    revalidatePath('/admin/certifications')
  })
}
