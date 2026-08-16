'use server'

import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { changePasswordSchema } from '@/lib/schemas/account'
import { toFieldErrors, type AdminState } from '@/lib/schemas/admin'
import { requireAdmin } from '@/data/_guards'
import { recordAudit } from '@/data/audit'

export async function changePasswordAction(
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

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        /**
         * Seluruh sesi LAIN dicabut.
         *
         * Alasan orang mengganti kata sandi hampir selalu "ada yang mungkin
         * bisa masuk". Membiarkan sesi lama tetap hidup membuat penggantian
         * itu tidak mengubah apa pun bagi siapa pun yang sudah masuk.
         */
        revokeOtherSessions: true,
      },
    })
  } catch (error) {
    /**
     * Kata sandi lama yang salah dibedakan dari kegagalan lain — ini satu
     * dari sedikit galat yang aman disebutkan, karena yang menanyakannya
     * sudah terbukti punya sesi admin yang sah.
     */
    const pesan = error instanceof Error ? error.message : ''

    if (/password|invalid|incorrect/i.test(pesan)) {
      return {
        status: 'error',
        message: 'Periksa kembali isian yang ditandai.',
        fieldErrors: { currentPassword: 'Kata sandi saat ini tidak cocok.' },
      }
    }

    console.error('Ganti kata sandi gagal:', (error as Error)?.name)

    return {
      status: 'error',
      message: 'Gagal mengganti kata sandi. Coba lagi.',
    }
  }

  /**
   * Yang dicatat hanya BAHWA kata sandi diganti — tidak ada bagian dari
   * kata sandinya, lama maupun baru, yang boleh menyentuh jejak audit.
   */
  await recordAudit({
    actorId: session.user.id,
    action: 'update',
    entityType: 'UserPassword',
    entityId: session.user.id,
    metadata: { revokedOtherSessions: true },
  })

  return {
    status: 'success',
    message:
      'Kata sandi diganti. Seluruh sesi lain sudah dikeluarkan; sesi ini tetap aktif.',
  }
}
