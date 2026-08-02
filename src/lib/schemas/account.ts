import { z } from 'zod'

/**
 * Ganti kata sandi admin.
 *
 * Kata sandi lama WAJIB diisi meski sesinya sudah terverifikasi. Sesi yang
 * ditinggalkan terbuka di perangkat orang lain adalah alasan paling umum
 * seseorang perlu mengganti kata sandi — dan tanpa kata sandi lama, sesi
 * itu justru bisa dipakai mengunci pemiliknya keluar.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Kata sandi saat ini wajib diisi.')
      .max(200),
    newPassword: z
      .string()
      .min(12, 'Kata sandi baru minimal 12 karakter.')
      .max(200),
    confirmPassword: z.string().max(200),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Ketikan ulang tidak sama dengan kata sandi baru.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Kata sandi baru harus berbeda dari yang sekarang.',
    path: ['newPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
