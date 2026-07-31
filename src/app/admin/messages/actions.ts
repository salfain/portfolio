'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/data/_guards'
import { deleteContactMessage, setMessageRead } from '@/data/contact'

import { runAdminDelete } from '../_lib/action-helpers'

export async function toggleMessageReadAction(id: string, isRead: boolean) {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Sesi berakhir.' }
  }

  return runAdminDelete(async () => {
    await setMessageRead(id, isRead)
    revalidatePath('/admin/messages')
  })
}

export async function deleteMessageAction(id: string) {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Sesi berakhir.' }
  }

  return runAdminDelete(async () => {
    await deleteContactMessage(id)
    revalidatePath('/admin/messages')
  })
}
