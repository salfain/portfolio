import { randomUUID } from 'node:crypto'

import { updateTag } from 'next/cache'
import { NextResponse } from 'next/server'

import { recordAudit } from '@/data/audit'
import { requireAdmin } from '@/data/_guards'
import { prisma } from '@/lib/prisma'
import {
  deleteAsset,
  detectProfileAssetType,
  getAssetKey,
  getAssetUrl,
  getObjectStorageConfig,
  isProfileAssetKind,
  MAX_PROFILE_ASSET_BYTES,
  profileAssetTypeError,
  PROFILE_ASSET_COLUMN,
  putAsset,
} from '@/lib/profile-asset-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Sesi tidak sah dijawab 404, bukan 401.
 *
 * 401 pada rute yang hanya ada di panel admin sudah memberi tahu bahwa
 * rutenya ada — 404 tidak membocorkan apa pun (06_SECURITY).
 */
async function requireSession() {
  try {
    return await requireAdmin()
  } catch {
    return null
  }
}

/** Baris profil tunggal beserta URL berkas yang sedang tersimpan. */
async function loadProfile() {
  return prisma.siteProfile.findFirst({
    select: {
      id: true,
      cvIdUrl: true,
      cvEnUrl: true,
      profileImageUrl: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

function readKind(value: FormDataEntryValue | string | null) {
  return typeof value === 'string' && isProfileAssetKind(value) ? value : null
}

export async function POST(request: Request) {
  const session = await requireSession()
  if (!session) return errorResponse('Tidak berwenang.', 404)

  const config = getObjectStorageConfig()
  if (!config)
    return errorResponse('Penyimpanan berkas belum dikonfigurasi.', 503)

  const formData = await request.formData()
  const kind = readKind(formData.get('kind'))

  if (!kind) return errorResponse('Jenis berkas tidak dikenali.', 400)

  // Profil disimpan sebagai satu baris tunggal. Tanpa baris itu tidak ada
  // tempat menaruh URL-nya, jadi unggahan ditolak dengan alasan yang bisa
  // ditindaklanjuti alih-alih membuat baris setengah jadi.
  const profile = await loadProfile()
  if (!profile) {
    return errorResponse(
      'Simpan profil terlebih dahulu sebelum mengunggah berkas.',
      409,
    )
  }

  const entry = formData.get('file')
  if (!(entry instanceof File))
    return errorResponse('Pilih berkas terlebih dahulu.', 400)

  if (entry.size === 0 || entry.size > MAX_PROFILE_ASSET_BYTES) {
    return errorResponse(
      'Ukuran berkas harus lebih dari 0 dan maksimal 8 MB.',
      413,
    )
  }

  const bytes = new Uint8Array(await entry.arrayBuffer())
  const detected = detectProfileAssetType(kind, bytes)

  if (!detected) return errorResponse(profileAssetTypeError(kind), 415)

  const column = PROFILE_ASSET_COLUMN[kind]
  const key = `profile/${kind}/${randomUUID()}.${detected.extension}`
  const url = getAssetUrl(config, key)

  try {
    await putAsset(config, key, bytes, detected.mimeType)
    await prisma.siteProfile.update({
      where: { id: profile.id },
      data: { [column]: url },
    })
  } catch (error) {
    // Objek yang sudah terunggah dibuang kembali kalau basis data gagal —
    // kalau tidak, bucket berisi berkas yang tidak ditunjuk baris mana pun.
    await deleteAsset(config, key).catch(() => undefined)
    console.error('Unggah berkas profil gagal:', (error as Error)?.name)
    return errorResponse('Berkas gagal diunggah. Coba lagi.', 500)
  }

  const previous = getAssetKey(config, profile[column])
  if (previous && previous !== key) {
    await deleteAsset(config, previous).catch(() => undefined)
  }

  await recordAudit({
    actorId: session.user.id,
    action: 'update',
    entityType: 'SiteProfile',
    entityId: profile.id,
    metadata: { asset: kind },
  })
  updateTag('profile')

  return NextResponse.json({ url })
}

export async function DELETE(request: Request) {
  const session = await requireSession()
  if (!session) return errorResponse('Tidak berwenang.', 404)

  const config = getObjectStorageConfig()
  if (!config)
    return errorResponse('Penyimpanan berkas belum dikonfigurasi.', 503)

  const kind = readKind(new URL(request.url).searchParams.get('kind'))
  if (!kind) return errorResponse('Jenis berkas tidak dikenali.', 400)

  const profile = await loadProfile()
  if (!profile) return errorResponse('Profil belum ada.', 404)

  const column = PROFILE_ASSET_COLUMN[kind]
  const key = getAssetKey(config, profile[column])

  if (key) await deleteAsset(config, key).catch(() => undefined)

  await prisma.siteProfile.update({
    where: { id: profile.id },
    data: { [column]: null },
  })

  await recordAudit({
    actorId: session.user.id,
    action: 'update',
    entityType: 'SiteProfile',
    entityId: profile.id,
    metadata: { asset: kind, removed: true },
  })
  updateTag('profile')

  return NextResponse.json({ ok: true })
}
