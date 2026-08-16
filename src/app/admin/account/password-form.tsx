'use client'

import { FormShell } from '@/components/admin/form-shell'
import { TextField } from '@/components/admin/form-fields'

import { changePasswordAction } from './actions'

export function PasswordForm() {
  return (
    <FormShell action={changePasswordAction} submitLabel="Ganti kata sandi">
      {(errors) => (
        <>
          <TextField
            name="currentPassword"
            label="Kata sandi saat ini"
            type="password"
            required
            error={errors.currentPassword}
          />

          <TextField
            name="newPassword"
            label="Kata sandi baru"
            type="password"
            required
            hint="Minimal 12 karakter. Panjang lebih menentukan daripada campuran simbol."
            error={errors.newPassword}
          />

          <TextField
            name="confirmPassword"
            label="Ketik ulang kata sandi baru"
            type="password"
            required
            error={errors.confirmPassword}
          />

          <p className="rounded-xl border border-border bg-elevated px-4 py-3 text-xs text-muted">
            Mengganti kata sandi akan{' '}
            <strong>mengeluarkan seluruh sesi lain</strong> di perangkat mana
            pun. Sesi yang sedang kamu pakai sekarang tetap aktif.
          </p>
        </>
      )}
    </FormShell>
  )
}
