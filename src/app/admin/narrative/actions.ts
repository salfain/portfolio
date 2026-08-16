'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

import {
  narrativeFormSchema,
  toFieldErrors,
  type AdminState,
} from '@/lib/schemas/admin'
import { pairNarrativeBlocks, parseNarrativeText } from '@/lib/narrative-format'
import { requireAdmin } from '@/data/_guards'
import { saveNarrative } from '@/data/settings'

import { runAdminMutation } from '../_lib/action-helpers'

export async function saveNarrativeAction(
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

  const parsed = narrativeFormSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Periksa kembali isian yang ditandai.',
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  const idBlocks = parseNarrativeText(parsed.data.blocksId)
  const enBlocks = parseNarrativeText(parsed.data.blocksEn)

  if (enBlocks.length > 0 && enBlocks.length !== idBlocks.length) {
    return {
      status: 'error',
      message:
        'Jumlah blok Inggris harus sama dengan Indonesia, atau dikosongkan.',
      fieldErrors: {
        blocksEn: `Ada ${idBlocks.length} blok Indonesia, tapi ${enBlocks.length} blok Inggris.`,
      },
    }
  }

  // Bahasa Indonesia adalah sumber kebenaran; Inggris dipasangkan
  // berdasarkan urutan (08_I18N_FALLBACK_POLICY §6).
  const blocks = pairNarrativeBlocks(idBlocks, enBlocks)

  return runAdminMutation(async () => {
    await saveNarrative(parsed.data.key, blocks)
    revalidateTag('settings')
    revalidatePath('/admin/narrative')
  }, `Tersimpan — ${blocks.length} blok.`)
}
