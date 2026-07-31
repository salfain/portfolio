import type { ReactNode } from 'react'

// Admin: tanpa segmen locale, nested layout (root layout pass-through).
// Antarmuka hanya bahasa Indonesia. Tema terang default.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" data-theme="light" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
