import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getSessionMock, redirectMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  redirectMock: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`)
  }),
}))

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers()),
}))
vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: getSessionMock } },
}))

import { requireAdmin, requireAdminPage } from '@/data/_guards'

describe('requireAdmin', () => {
  beforeEach(() => {
    getSessionMock.mockReset()
    redirectMock.mockClear()
  })

  it('menolak pengunjung tanpa sesi', async () => {
    getSessionMock.mockResolvedValue(null)

    await expect(requireAdmin()).rejects.toThrow('UNAUTHORIZED')
  })

  it('menolak pengguna non-admin', async () => {
    getSessionMock.mockResolvedValue({ user: { role: 'user' } })

    await expect(requireAdmin()).rejects.toThrow('UNAUTHORIZED')
  })

  it('menerima pengguna admin', async () => {
    const session = { user: { role: 'admin' } }
    getSessionMock.mockResolvedValue(session)

    await expect(requireAdmin()).resolves.toBe(session)
  })
})

describe('requireAdminPage', () => {
  beforeEach(() => {
    getSessionMock.mockReset()
    redirectMock.mockClear()
  })

  it('mengarahkan pengunjung tanpa sesi ke login', async () => {
    getSessionMock.mockResolvedValue(null)

    await expect(requireAdminPage()).rejects.toThrow(
      'REDIRECT:/admin/login',
    )
  })

  it('mengarahkan pengguna non-admin ke login', async () => {
    getSessionMock.mockResolvedValue({ user: { role: 'user' } })

    await expect(requireAdminPage()).rejects.toThrow(
      'REDIRECT:/admin/login',
    )
  })

  it('menerima halaman untuk pengguna admin', async () => {
    const session = { user: { role: 'admin' } }
    getSessionMock.mockResolvedValue(session)

    await expect(requireAdminPage()).resolves.toBe(session)
  })
})
