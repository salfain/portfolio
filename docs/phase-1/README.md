# FASE 1 — FONDASI, I18N, TEMA, PRISMA, BETTER AUTH

**Status:** ✅ Selesai
**Tanggal mulai:** 31 Juli 2026
**Tanggal selesai:** 31 Juli 2026

---

## Yang dibuat

### Fondasi aplikasi

- Scaffold Next.js 15 App Router + TypeScript strict (manual, tanpa `create-next-app`)
- Tailwind + design token CSS variable (terang/gelap dari `02_STYLING.md`)
- Font self-hosted via `next/font`: Plus Jakarta Sans, Inter, JetBrains Mono
- `cn()` helper (clsx + tailwind-merge)

### i18n (next-intl)

- Rute bilingual `/id` · `/en`, `localePrefix: 'always'`
- `src/i18n/{routing,navigation,request}.ts`
- `middleware.ts` (matcher mengecualikan `/admin` dan `/api`)
- `messages/{id,en}.json` — kunci SAMA di kedua berkas (tes parity menjaga)
- `src/lib/i18n-content.ts` — `pickLocale` + `isLocaleComplete` (fallback aman per `08_I18N_FALLBACK_POLICY.md`)
- Boundary terlokalisasi: `not-found.tsx`, `error.tsx`, `loading.tsx`

### Tema

- `next-themes` dengan `attribute="data-theme"` — tanpa flash (script blocking)
- `theme-toggle.tsx` — area sentuh 44×44, hydration-safe

### Prisma + PostgreSQL

- `prisma/schema.prisma` — disalin dari `07_SCHEMA_DECISIONS.md` §2
- `src/lib/prisma.ts` — singleton client
- `src/data/_guards.ts` — `requireAdmin()` (`server-only`)
- **Migrasi selesai** — Docker PostgreSQL 16 live, 2 migrasi diterapkan
  (`init` + `better-auth-align`). Lihat NOTES N3 & N5.

### Better Auth (admin-only)

- `src/lib/auth.ts` — email+password, tanpa sign-up, plugin admin
- `src/app/api/auth/[...all]/route.ts`
- `/admin/login` (teks Indonesia langsung) + `/admin` (cek sesi)
- `prisma/seed.ts` — idempoten, kredensial dari env var

### Validasi & tes

- `src/lib/env.ts` — Zod, throw bila invalid
- `vitest` + `src/test/setup.ts`
- Tes: `i18n-content.test.ts` (fallback logic), `messages-parity.test.ts` (kunci sinkron)

---

## Keputusan yang diambil

1. **`next-themes`** untuk tema tanpa flash — bukan library animasi/UI kedua (selaras aturan).
2. **Root layout passthrough** `<html suppressHydrationWarning>` tanpa `lang` per-locale. `[locale]` & `admin` adalah nested layout. Keterbatasan: `lang` di `<html>` statis. Lihat NOTES.
3. **`Session.ipAddress`** tetap (IP admin default) — keputusan pemilik.
4. **Hash password seed** memakai `hashPassword` dari `better-auth/crypto` (bukan scrypt Node stdlib). Format Better Auth: `<salt-hex>:<key-hex>`. Lihat NOTES N3.
5. **Domain** `salfain.web.id` di `NEXT_PUBLIC_SITE_URL`.
6. **`User.role`** bertipe `String @default("user")` (bukan enum) — plugin admin Better Auth menulis string `"user"`/`"admin"`. Enum `UserRole` dihapus. Lihat NOTES N3.
7. **`dotenv-cli`** memuat `.env.local` untuk script `db:*` — Prisma CLI hanya memuat `.env`, bukan `.env.local`.

---

## Keterbatasan yang tersisa

- **`<html lang>` tidak dinamis per-locale** — perlu route group `(app)/(admin)` dengan root layout masing-masing. Tunda sampai classifier shell pulih (lihat NOTES).
- **Verifikasi skema Better Auth via CLI** belum bisa dijalankan — `@better-auth/cli` (jiti/c12) tidak mengenali path alias `@/`. Verifikasi dilakukan manual via tipe skema. Lihat NOTES N3.
- **Konfigurasi teks `indonesian` Postgres** belum diverifikasi (relevan Fase 7).
- **Ekstensi `pg_trgm`/`unaccent`** sudah dibuat via init script Docker (belum dipakai sampai Fase 7).
- **Uji login nyata** — ✅ selesai. Login via UI `admin@example.com` berhasil, redirect ke `/admin`.

---

## Dibutuhkan untuk fase berikutnya

- Docker Desktop live → ✅ selesai (migrasi + seed + verifikasi Better Auth)
- Dev server → ✅ selesai (fix `NextIntlClientProvider` messages, lihat NOTES N6)
- Semua gerbang lolos: lint ✓, typecheck ✓, test 13/13 ✓, build ✓
- Fase 2: shell publik (navbar, drawer, footer), motion, design system komponen
