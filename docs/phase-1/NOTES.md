# FASE 1 — CATATAN DI LUAR CAKUPAN

## Temuan di luar cakupan

### N1 — `<html lang>` tidak dinamis per-locale

**Lokasi:** `src/app/layout.tsx`

Root layout statis `<html suppressHydrationWarning>` tanpa `lang` per-locale.
`[locale]/layout.tsx` dan `admin/layout.tsx` adalah nested layout (tidak boleh
render `<html>` sendiri). Akibatnya `lang` tidak bisa di-set ke `id`/`en`/`id`
secara dinamis dari nested layout.

**Solusi benar:** route group `src/app/(app)/` dan `src/app/(admin)/` dengan
root layout masing-masing yang render `<html lang>` sendiri. Membutuhkan `mv`
file yang tidak bisa dijalankan karena classifier shell sementara down.

**Dampak:** aksesibilitas WCAG 3.1.2 (bahasa konten) tidak sempurna —
screen reader tidak tahu bahasa halaman dari `<html>`. `NextIntlClientProvider`
tetap berfungsi (locale via segment + middleware).

**Tidak diperbaiki:** di luar kemampuan tooling saat ini (shell down).
Dikerjakan saat classifier pulih, sebelum Fase 2.

---

### N2 — Folder route group kosong

`src/app/(app)/` dan `src/app/(admin)/` tercipta kosong saat upaya restructuring
yang dibatalkan. Folder kosong diabaikan Next.js, tidak berdampak. Dihapus saat
N1 dikerjakan.

---

### N3 — Hash password seed belum diverifikasi terhadap Better Auth

**Lokasi:** `prisma/seed.ts`

Hash memakai `scrypt` (Node stdlib). Better Auth default juga scrypt, tapi
format penyimpanan (salt encoding, field name) **wajib diverifikasi** dengan
`npx @better-auth/cli generate` + uji login nyata setelah Docker live.

**Status: SELESAI (31 Juli 2026).** Verifikasi terhadap `better-auth@1.6.25`:

1. **Hash password** — Better Auth memakai `@better-auth/utils/password`:
   scrypt `N=16384 r=16 p=1 dkLen=64`, format `<salt-hex>:<key-hex>` (tanpa
   prefix `scrypt:`). `prisma/seed.ts` diperbarui memakai `hashPassword` dari
   `better-auth/crypto` (export publik). Implementasi scrypt Node stdlib lama
   dihapus — formatnya tidak kompatibel.
2. **CLI generate gagal** — `@better-auth/cli` memakai jiti/c12 yang tidak
   mengenali path alias `@/` di `src/lib/auth.ts`. Verifikasi dilakukan manual
   dengan membaca tipe skema dari `node_modules/@better-auth/core/dist/db/schema/`
   dan `node_modules/better-auth/dist/plugins/admin/schema.d.mts`.
3. **Skema Better Auth** — 4 perbedaan ditemukan & diperbaiki di
   `prisma/schema.prisma` (migrasi `20260731123121_better_auth_align`):
   - `User.role`: `enum UserRole` → `String @default("user")` (plugin admin
     menulis string `"user"`/`"admin"`, bukan enum). Enum `UserRole` dihapus.
   - `User.banned` `Boolean @default(false)` ditambah (plugin admin).
   - `User.banReason` `String?` ditambah (plugin admin).
   - `User.banExpires` `DateTime?` ditambah (plugin admin).
   - `Session.impersonatedBy` `String?` ditambah (plugin admin).
4. **Uji login nyata** — SELESAI (31 Juli 2026). Login via UI
   `http://localhost:3000/admin/login` dengan `admin@example.com` berhasil,
   redirect ke `/admin` (Dasbor Admin). Hash format kompatibel dikonfirmasi.

---

### N4 — Konfigurasi teks `indonesian` Postgres belum diverifikasi

Dari `07_SCHEMA_DECISIONS.md` §4. Cek `\dF` di psql; bila tidak ada → pakai
`simple` + `pg_trgm`. Relevan Fase 7 (full-text search), bukan Fase 1.

**Status: tetap ditunda ke Fase 7.** Ekstensi `pg_trgm` + `unaccent` sudah
dibuat via `docker/init-extensions.sql` (idempotent, jalan saat init container).
Konfigurasi text search `indonesian` belum dicek — bukan penghambat Fase 1.

---

### N5 — `prisma db push` dilarang, `migrate dev` butuh DB

Per `07_DATA_PRISMA.md` §6, skema hanya bisa di-migrate via `prisma migrate dev`
yang butuh koneksi DB. Sampai Docker live, `prisma generate` (client) tetap jalan
tanpa DB — sudah dipakai di CI.

**Status: SELESAI (31 Juli 2026).** Docker PostgreSQL 16 live
(`docker-compose.yml`). Dua migrasi diterapkan:
- `20260731122535_init` — seluruh skema dari `07_SCHEMA_DECISIONS.md`
- `20260731123121_better_auth_align` — koreksi skema Better Auth (lihat N3)
Script `db:*` di `package.json` memakai `dotenv-cli` untuk memuat `.env.local`
(Prisma CLI tidak memuat `.env.local` secara default, hanya `.env`).

---

### N6 — `NextIntlClientProvider` missing `messages` prop

**Lokasi:** `src/app/[locale]/layout.tsx`

`NextIntlClientProvider` di-render tanpa prop `messages`. Akibatnya runtime
error `MISSING_MESSAGE: No messages were configured on the provider` saat dev.

**Status: SELESAI (31 Juli 2026).** Tambah `getMessages()` dari
`next-intl/server` + prop `messages={messages}` di provider. Catatan:
`getMessages` diekspor dari `next-intl/server`, bukan `next-intl` langsung.
