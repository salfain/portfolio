'use server'

import { revalidateTag } from 'next/cache'

import {
  profileSchema,
  toFieldErrors,
  type AdminState,
} from '@/lib/schemas/admin'
import { requireAdmin } from '@/data/_guards'
import { saveProfile } from '@/data/profile'

import { runAdminMutation } from '../_lib/action-helpers'

export async function saveProfileAction(
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

  const parsed = profileSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  return runAdminMutation(async () => {
    await saveProfile(parsed.data)
    revalidateTag('profile')
  }, 'Profil tersimpan.')
}
