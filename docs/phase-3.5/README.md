# FASE 3.5 — DEPLOY

**Status:** 🟡 Artefak siap · ⏳ eksekusi menunggu pemilik
**Kenapa dimajukan dari Fase 8:** situs live lebih awal berarti umpan balik
nyata lebih awal, dan domain sudah dipegang sejak Fase 0 (Q3).

---

## Yang sudah disiapkan

| Berkas | Isi |
|---|---|
| `src/app/robots.ts` | Blokir `/admin` & `/api/`, tunjuk sitemap |
| `src/app/sitemap.ts` | 9 rute statis + seluruh proyek terbit, × 2 locale, dengan `hreflang` |
| `.env.example` | Seluruh variabel yang dibutuhkan |
| `src/lib/env.ts` | Validasi Zod — build gagal cepat bila ada yang kurang |

`/recruiter` **sengaja tidak** masuk sitemap dan **tidak** di-`Disallow`:
halaman itu ber-`noindex` lewat metadata, dan `Disallow` justru mencegah
crawler membaca tag `noindex`-nya.

---

## Yang HANYA bisa dikerjakan pemilik

Semuanya butuh akun atau kredensial yang tidak boleh ada di repositori.

### 1. Jawab Q11 & Q12

`docs/phase-0/06_OPEN_QUESTIONS.md`:

- **Q11 — platform hosting.** Rekomendasi tetap Vercel: integrasi Next.js
  paling rapat, gratis untuk skala ini, dan preview per-PR otomatis.
- **Q12 — pengiriman email.** Resend butuh domain terverifikasi. Perlu juga
  alamat penerima notifikasi form kontak.

### 2. Database produksi

Docker lokal tidak bisa dipakai produksi. Pilihan yang kompatibel dengan
skema saat ini (butuh `pg_trgm` + `unaccent`, lihat `docker/init-extensions.sql`):

| Opsi | Catatan |
|---|---|
| Neon | Serverless, gratis untuk skala ini, mendukung kedua ekstensi |
| Supabase | Gratis, membawa fitur yang tidak dipakai |
| Vercel Postgres | Integrasi paling mulus, kuota gratis lebih ketat |

Setelah dibuat:

```bash
DATABASE_URL="<url-produksi>" npx prisma migrate deploy
DATABASE_URL="<url-produksi>" ADMIN_SEED_EMAIL=... ADMIN_SEED_PASSWORD=... npm run db:seed
```

`migrate deploy`, **bukan** `migrate dev` — `dev` boleh me-reset database.

### 3. Variabel environment di hosting

| Variabel | Nilai |
|---|---|
| `DATABASE_URL` | URL database produksi |
| `BETTER_AUTH_SECRET` | **Baru**, bukan salinan dari lokal — `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://salfain.web.id` |
| `NEXT_PUBLIC_SITE_URL` | `https://salfain.web.id` |

`ADMIN_SEED_*` **jangan** dipasang di hosting. Seed dijalankan sekali dari
mesin lokal terhadap database produksi, lalu variabelnya dibuang.

### 4. Domain & HTTPS

`salfain.web.id` diarahkan ke hosting. HTTPS otomatis di Vercel. Setelah
aktif, verifikasi `BETTER_AUTH_URL` cocok persis dengan domain final —
ketidakcocokan menghasilkan `INVALID_ORIGIN` saat login (sudah terbukti
saat verifikasi Fase 3b).

---

## Penghambat yang harus tuntas sebelum live

| # | Penghambat | Sumber |
|---|---|---|
| 1 | Perlindungan form kontak baru 2 dari 4 lapisan | NOTES N3 |
| 2 | Keputusan `dynamicParams` — proyek baru belum muncul sampai build ulang | NOTES N2 |
| 3 | Cache build bertahan antar-deploy | NOTES N12 |
| 4 | Situs masih kosong — Q4–Q10 belum dijawab | NOTES N6 |
| 5 | `next-intl` open redirect (GHSA-8f24-v5vv-gm5j) | lihat di bawah |

### 🔴 `npm audit fix --force` DILARANG di repositori ini

npm menyarankan "perbaikan" untuk `postcss`, `sharp`, dan `vite` berupa
**`next@9.3.3`** — turun enam versi mayor dari Next.js 15.5 yang dipakai
sekarang. Menjalankannya akan menghancurkan seluruh aplikasi. Saran itu
muncul karena npm mencari versi mana pun yang tidak punya dependency
bermasalah, tanpa peduli apakah masuk akal.

Penilaian sebenarnya dari 8 temuan:

| Paket | Label npm | Penilaian nyata |
|---|---|---|
| `vitest` | CRITICAL | Hanya berlaku bila `vitest --ui` dijalankan. Kita tidak memakainya, dan ini devDependency yang tidak ikut ke produksi. |
| `postcss`, `sharp` | HIGH | Transitif lewat Next.js, hanya dipakai saat build. Ikut selesai saat Next.js naik versi minor. |
| `esbuild`, `vite`, `vite-node` | HIGH/MODERATE | Dev server Vitest saja. Tidak ikut ke produksi. |
| **`next-intl`** | MODERATE | **Ini yang nyata.** Open redirect di lapisan routing yang ikut terbit. |

`next-intl` 3.26.5 terpasang; perbaikannya di **≥ 4.9.1**, yaitu lompatan
mayor dengan perubahan API routing. Belum bisa dieksploitasi sekarang
karena situsnya belum live — tapi **wajib tuntas sebelum deploy.**

Temuan kedua di paket yang sama (prototype pollution lewat
`experimental.messages.precompile`) **tidak berlaku** — fitur itu tidak
dipakai di proyek ini.

Nomor 1 dikerjakan di Fase 8 bersama audit keamanan. Nomor 4 adalah Fase 9.

**Menerbitkan situs kosong tidak menguntungkan siapa pun** — recruiter yang
membuka halaman tanpa isi tidak akan kembali. Urutan yang disarankan: isi
konten dulu (Fase 9 minimal), baru deploy.

---

## Verifikasi setelah live

```bash
curl -s https://salfain.web.id/robots.txt
curl -s https://salfain.web.id/sitemap.xml | head -20
curl -s -o /dev/null -w "%{http_code}\n" https://salfain.web.id/admin   # harus 307
curl -s https://salfain.web.id/en/recruiter | grep -o 'noindex'
```

Plus delapan titik uji manual dari `09_DEFINITION_OF_DONE.md`.

---

## Rollback

Vercel menyimpan setiap deploy sebagai immutable. Rollback = promote deploy
sebelumnya, hitungan detik, tanpa build ulang.

**Yang TIDAK ikut ter-rollback: migrasi database.** Migrasi yang sudah
diterapkan tetap ada. Karena itu migrasi harus selalu aditif — menambah
kolom nullable, bukan mengubah atau menghapus kolom terpakai.
