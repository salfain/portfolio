'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth-client'

import { cn } from '@/lib/cn'

// Antarmuka admin hanya bahasa Indonesia — teks boleh langsung di JSX.
// Lihat docs/rules/03_I18N.md §8.
export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn.email({ email, password })

    if (result.error) {
      setError('Email atau kata sandi salah.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl">Masuk Admin</h1>
        <p className="mt-2 text-sm text-muted">
          Hanya untuk administrator. Tidak ada pendaftaran publik.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                'w-full rounded-md border border-border-strong bg-surface px-4 py-2.5',
                'text-foreground placeholder:text-muted',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                'w-full rounded-md border border-border-strong bg-surface px-4 py-2.5',
                'text-foreground placeholder:text-muted',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              )}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full rounded-md bg-primary px-4 py-2.5',
              'font-medium text-primary-foreground',
              'transition-opacity hover:opacity-90',
              'disabled:opacity-50',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
            )}
          >
            {loading ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
      </div>
    </main>
  )
}
