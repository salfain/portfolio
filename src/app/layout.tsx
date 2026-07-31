import type { ReactNode } from 'react'

import '@/styles/globals.css'

// Root layout: pass-through. <html><body> di-render oleh nested layout
// ([locale]/layout.tsx atau admin/layout.tsx) agar lang akurat per-route.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
