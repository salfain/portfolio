'use client'

// global-error.tsx wajib client, menggantikan root layout saat error
// fatal — jadi harus merender <html><body> sendiri (05_ROUTE §5).
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="id">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <div className="grid min-h-dvh place-items-center px-5">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold">
              Kesalahan aplikasi
            </h1>
            <p className="mt-3 text-muted">
              Terjadi kesalahan tak terduga. Muat ulang untuk mencoba lagi.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-8 rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Muat ulang
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
