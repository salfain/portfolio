import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// SATU-SATUNYA sumber Link, redirect, usePathname, useRouter.
// Jangan pernah import dari 'next/link' — lihat docs/rules/03_I18N.md §7.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
