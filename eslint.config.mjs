import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { FlatCompat } from '@eslint/eslintrc'

/**
 * Konfigurasi ESLint flat.
 *
 * Next 16 menghapus `next lint`, jadi gerbang lint sekarang memanggil
 * ESLint CLI langsung dan ESLint 9 membaca berkas ini, bukan
 * `.eslintrc.json`.
 *
 * `FlatCompat` dipakai supaya `eslint-config-next` — yang masih berbentuk
 * konfigurasi lama — bisa dipakai apa adanya. Aturan proyek di bawahnya
 * disalin persis dari `.eslintrc.json` sebelumnya, termasuk alasan setiap
 * larangan impor. Tidak ada aturan yang dilonggarkan dalam migrasi ini.
 */
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
})

const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'next-env.d.ts',
    ],
  },

  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          name: 'next/link',
          message:
            'Gunakan Link dari @/i18n/navigation, bukan next/link. Rute publik harus selalu berawalan locale. (Rute admin dikecualikan lewat blok di bawah.)',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  {
    // Rute admin TIDAK berawalan locale
    // (docs/phase-0/05_ROUTE_AND_PRIORITY_MAP.md §3) — Link ber-locale di
    // sini menghasilkan /id/admin/... Larangannya dibalik: di sini
    // next/link yang benar.
    files: [
      'src/app/admin/**/*.{ts,tsx}',
      'src/components/admin/**/*.{ts,tsx}',
      'src/middleware.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          name: '@/i18n/navigation',
          message:
            'Rute admin TIDAK berawalan locale (docs/phase-0/05_ROUTE_AND_PRIORITY_MAP.md §3) — Link ber-locale di sini menghasilkan /id/admin/... Pakai next/link dan next/navigation.',
        },
      ],
    },
  },
]

export default config
