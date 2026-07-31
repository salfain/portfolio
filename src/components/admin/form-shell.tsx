'use client'

import { useActionState, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui'
import type { AdminState } from '@/lib/schemas/admin'

const initialState: AdminState = { status: 'idle' }

type FormShellProps = {
  action: (state: AdminState, formData: FormData) => Promise<AdminState>
  submitLabel?: string
  /** Menerima error per-field supaya bisa diteruskan ke tiap input. */
  children: (fieldErrors: Record<string, string>) => ReactNode
}

/**
 * Kerangka form admin: menjalankan server action, menampilkan hasilnya,
 * dan mengoper error per-field ke input yang bersangkutan.
 */
export function FormShell({
  action,
  submitLabel = 'Simpan',
  children,
}: FormShellProps) {
  const [state, formAction] = useActionState(action, initialState)
  const fieldErrors = state.status === 'error' ? (state.fieldErrors ?? {}) : {}

  return (
    <form action={formAction} className="max-w-2xl space-y-6" noValidate>
      {children(fieldErrors)}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      {state.status === 'success' ? (
        <p role="status" className="text-sm text-success">
          {state.message}
        </p>
      ) : null}

      <SubmitButton label={submitLabel} />
    </form>
  )
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" loading={pending}>
      {pending ? 'Menyimpan…' : label}
    </Button>
  )
}
