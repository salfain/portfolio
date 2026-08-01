import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/prisma', () => ({ prisma: {} }))
// `audit.ts` menarik guard → auth → env. Tes ini hanya menyentuh fungsi
// murni, jadi rantai itu diputus di sini alih-alih menyiapkan env palsu.
vi.mock('@/data/_guards', () => ({
  requireAdmin: vi.fn(),
  requireAdminPage: vi.fn(),
}))

import { auditActionForStatus } from '@/data/audit'

/**
 * Perpindahan status yang dicatat keliru membuat jejak audit menjawab
 * pertanyaan yang salah — "kapan dokumen ini terbit" adalah pertanyaan
 * pertama saat ada isi yang seharusnya belum boleh publik.
 */
describe('auditActionForStatus', () => {
  it('entitas baru selalu create, apa pun statusnya', () => {
    expect(auditActionForStatus(null, 'DRAFT')).toBe('create')
    expect(auditActionForStatus(null, 'PUBLISHED')).toBe('create')
  })

  it('draft menjadi terbit dicatat sebagai publish', () => {
    expect(auditActionForStatus('DRAFT', 'PUBLISHED')).toBe('publish')
    expect(auditActionForStatus('IN_REVIEW', 'PUBLISHED')).toBe('publish')
  })

  it('terbit menjadi arsip dicatat sebagai archive', () => {
    expect(auditActionForStatus('PUBLISHED', 'ARCHIVED')).toBe('archive')
  })

  it('terbit dikembalikan ke draft dicatat sebagai unpublish', () => {
    expect(auditActionForStatus('PUBLISHED', 'DRAFT')).toBe('unpublish')
  })

  it('menyunting tanpa mengubah status dicatat sebagai update', () => {
    expect(auditActionForStatus('PUBLISHED', 'PUBLISHED')).toBe('update')
    expect(auditActionForStatus('DRAFT', 'DRAFT')).toBe('update')
  })
})
