import { redirect } from 'next/navigation'

// Middleware next-intl sudah menangani '/' → '/id'.
// Halaman ini sebagai fallback bila middleware ter-skip.
export default function RootPage() {
  redirect('/id')
}
