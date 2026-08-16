import { z } from 'zod'

// Validasi environment di batas server. Dipanggil di entry points
// (middleware, auth config, prisma). Throw bila ada yang invalid —
// lebih baik gagal awal daripada runtime error samar.
// Lihat docs/rules/06_SECURITY.md §1.

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL harus URL PostgreSQL valid')
    .regex(/^postgres(ql)?:\/\//, 'DATABASE_URL harus mulai postgresql://'),

  BETTER_AUTH_SECRET: z
    .string()
    .min(
      32,
      'BETTER_AUTH_SECRET minimal 32 karakter — generate: openssl rand -base64 32',
    ),

  BETTER_AUTH_URL: z
    .string()
    .url('BETTER_AUTH_URL harus URL valid')
    .default('http://localhost:3000'),

  ADMIN_SEED_EMAIL: z.string().email().optional(),
  ADMIN_SEED_PASSWORD: z.string().min(8).optional(),

  // Satu-satunya NEXT_PUBLIC_ yang diizinkan.
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url('NEXT_PUBLIC_SITE_URL harus URL valid')
    .default('https://salfain.web.id'),

  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Variabel environment tidak valid:')
    parsed.error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    })
    throw new Error('Variabel environment tidak valid. Lihat log di atas.')
  }

  return parsed.data
}

// Catatan: loadEnv dipanggil sekali saat modul diimpor.
// Di dev (hot-reload) modul di-cache per-process, jadi aman.
export const env = loadEnv()
