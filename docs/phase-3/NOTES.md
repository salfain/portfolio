# FASE 3 — CATATAN & TEMUAN

---

## N0 — Middleware TIDAK PERNAH BERJALAN sejak Fase 1 (SELESAI) 🔴

**Lokasi:** `middleware.ts` → dipindah ke `src/middleware.ts`

Ditemukan saat menguji guard admin 3b: seluruh rute admin membalas 500,
bukan redirect. Ternyata `middleware-manifest.json` hasil build **kosong**:

```json
{ "version": 3, "middleware": {}, "functions": {}, "sortedMiddleware": [] }
```

**Sebab:** berkasnya ada di akar repositori, sementara `app` ada di `src/`.
Next.js hanya mengenali middleware yang sejajar dengan `app` — jadi harus
`src/middleware.ts`. Tidak ada peringatan apa pun; berkasnya diabaikan diam-diam.

**Berapa lama tidak ketahuan:** sejak Fase 1. Gate lint/typecheck/test/build
semuanya hijau selama itu, karena tidak ada satu pun yang memeriksa apakah
middleware benar-benar terdaftar.

**Yang selama ini tidak berjalan:**

| Fitur | Akibat |
|---|---|
| Negosiasi `Accept-Language` | Kunjungan pertama tidak pernah mendeteksi bahasa peramban |
| Cookie `NEXT_LOCALE` | Pilihan bahasa tidak pernah diingat antar-kunjungan |
| Redirect `/` → `/id` | Masih jalan, tapi lewat `src/app/page.tsx` — bukan middleware |

Redirect `/` yang tetap bekerja itulah yang menyamarkan masalahnya: sekilas
middleware terlihat berfungsi.

**Perbaikan:** berkas dipindah ke `src/middleware.ts`, impor disesuaikan ke
`./i18n/routing`. Terverifikasi terdaftar dengan matcher yang benar.

---

## N1 — `Button asChild` rusak sejak Fase 2 (SELESAI)

**Lokasi:** `src/components/ui/button.tsx`

`asChild` tidak pernah dipakai di Fase 2, jadi kerusakannya tidak pernah
terlihat. Begitu Fase 3a memakainya untuk tombol berbentuk tautan, build
produksi langsung gagal:

```
Error: Slot failed to slot onto its children.
Expected a single React element child or `Slottable`.
```

**Sebab:** Radix `Slot` menerima dua anak — spinner `loading` dan `children`.

**Perbaikan:** bungkus `children` dengan `Slottable` dari
`@radix-ui/react-slot`. Slot jadi tahu anak mana yang menerima prop, spinner
tetap jadi saudara, dan `loading` tetap berfungsi bersama `asChild`. Di luar
Slot, `Slottable` hanya merender anaknya apa adanya.

**Pelajaran:** komponen yang lolos gate tapi tidak pernah dipanggil belum
terbukti bekerja. Gate Fase 2 hijau karena `asChild` tidak pernah dirender.

---

## N2 — `notFound()` mengembalikan 200 pada rute ber-`revalidate` (SEBABNYA KELIRU)

> ⚠️ Gejalanya nyata, tapi sebabnya bukan `revalidate` maupun `dynamicParams`.
> Penyebab sebenarnya `src/app/[locale]/loading.tsx`; lihat
> [docs/phase-5/NOTES.md](../phase-5/NOTES.md) N1. `/projects/[slug]` sudah
> dikembalikan ke `dynamicParams = true`.

**Lokasi:** `src/app/[locale]/projects/[slug]/page.tsx`

Dengan `dynamicParams = true` (default), `notFound()` di dalam rute dinamis
yang punya `export const revalidate` **disajikan dengan status 200**. Isinya
memang halaman not-found — tidak ada kebocoran isi draft — tapi statusnya
salah. Terverifikasi pada Next.js 15.5.22, termasuk pada permintaan pertama
(`x-nextjs-cache: MISS`), jadi ini bukan sekadar efek cache.

Status 200 untuk slug draft melanggar `05_ROUTE_AND_PRIORITY_MAP.md` §6 dan
membuat mesin pencari mengindeks draft sebagai halaman sah.

**Perbaikan:** `export const dynamicParams = false`. Slug di luar hasil
`generateStaticParams()` ditolak router sebelum halaman dirender.

### ⚠️ Konsekuensi yang harus diputuskan sebelum 3b

`generateStaticParams()` hanya berjalan saat build. Artinya **proyek yang baru
diterbitkan lewat admin tidak muncul sampai build berikutnya** —
`revalidateTag('projects')` menyegarkan data, bukan daftar slug.

Tiga jalan keluar, perlu keputusan pemilik di Fase 3b:

| Opsi | Konsekuensi |
|---|---|
| A. Deploy hook — publikasi memicu build ulang | Paling sederhana di Vercel; jeda 1–2 menit sebelum proyek live |
| B. Rute detail dibuat dinamis (tanpa `revalidate`) | Proyek langsung live; LCP lebih lambat, halaman tidak lagi statis |
| C. Tetap seperti sekarang | Terima jeda sampai build berikutnya |

---

## N3 — Perlindungan form kontak belum lengkap 🔴 MENGHAMBAT FASE 3.5

`06_SECURITY.md` §6 mensyaratkan empat lapisan. Yang aktif sekarang:

| # | Lapisan | Status |
|---|---|---|
| 1 | Honeypot | ✅ |
| 2 | Validasi Zod di server | ✅ |
| 3 | Rate limit | ⚠️ **per email, bukan per IP** |
| 4 | Cloudflare Turnstile | ❌ belum ada |

**Kenapa belum dikerjakan:**

- Rate limit per IP mensyaratkan penyimpanan **hash IP + garam** (PRD bab 17
  melarang IP mentah). Itu tabel baru = perubahan skema, dan CLAUDE.md
  mewajibkan bertanya lebih dulu.
- Turnstile butuh dependency baru dan kunci akun Cloudflare — di luar rencana
  Fase 3 dan butuh persetujuan.

Rate limit per email mudah dilewati bot yang mengganti alamat setiap kirim.
**Keduanya wajib tuntas sebelum situs live.**

---

## N4 — `/admin/*` tidak dijaga middleware (SELESAI di 3b)

**Lokasi:** `src/middleware.ts`, `src/app/admin/page.tsx`

`matcher` mengecualikan `admin`, jadi **tidak ada** guard middleware. Komentar
di `admin/page.tsx` menulis "Middleware sudah guard /admin/\*" — itu keliru dan
menyesatkan siapa pun yang menambah halaman admin baru.

Saat ini tetap aman: `admin/page.tsx` memeriksa sesi sendiri, dan itu justru
lapisan yang menentukan (`06_SECURITY.md` §2). Tapi `05_ROUTE_AND_PRIORITY_MAP.md`
§6 meminta dua lapisan, dan 3b menambah enam rute admin baru — mengandalkan
ingatan per halaman itu rapuh.

**Perbaikan di 3b:** guard `/admin/*` ditambahkan (kecuali `/admin/login`),
komentar yang keliru diperbaiki, dan setiap fungsi data tetap memanggil
guard-nya sendiri. Perlu N0 dibereskan lebih dulu — middleware-nya memang
belum pernah berjalan sama sekali.

Cookie dibaca langsung dari `request.cookies`, BUKAN lewat `getSessionCookie()`
dari `better-auth/cookies`: helper itu menarik `jose`, yang memakai
`CompressionStream` dan memicu peringatan "not supported in the Edge Runtime"
saat build. Middleware hanya perlu tahu cookie-nya ada, jadi tidak butuh
kripto sama sekali.

---

## N5 — `unstable_cache`, bukan `'use cache'`

`07_DATA_PRISMA.md` §5 mencontohkan `'use cache'` + `cacheTag()`. Direktif itu
butuh `experimental.cacheComponents` (dulu `dynamicIO`) yang belum aktif di
proyek ini — menyalakannya mengubah perilaku render seluruh aplikasi dan
berada di luar cakupan Fase 3.

Yang dipakai: `unstable_cache(fn, keyParts, { tags })` dari `next/cache` —
API stabil di Next 15 dengan semantik tag yang sama, jadi `revalidateTag()` di
Fase 3b tetap bekerja apa adanya.

**Ditinjau ulang di Fase 8** bersama audit performa.

**Pembaruan Next 16.** `revalidateTag` kini menuntut argumen kedua berupa
profil kedaluwarsa, dan untuk efek SEKETIKA di dalam Server Action
disediakan `updateTag` dengan semantik read-your-own-writes. Seluruh server
action pindah ke `updateTag`; route handler unggah gambar sertifikat —
yang bukan Server Action, jadi tidak boleh memakainya — memakai
`revalidateTag('certificates', { expire: 0 })`. `unstable_cache` sendiri
tidak berubah.

---

## N6 — Q4–Q10 masih kosong 🔴 MENGHAMBAT ISI FASE 3

`docs/phase-0/06_OPEN_QUESTIONS.md`. Struktur kode sudah siap menerima isinya,
tapi situs tetap kosong sampai dijawab:

| | Pertanyaan | Menghambat |
|---|---|---|
| Q4 | Nama perusahaan & sekolah boleh disebut? | `/experience` |
| Q5 | Insiden nyata atau reproduksi lab? | Integritas — Fase 6 |
| Q6 | Metrik yang benar-benar ada catatannya | Bagian "Ringkasan" |
| Q7 | Konfirmasi 3 proyek rilis | "Pekerjaan Pilihan" |
| Q8 | Pilihan headline hero (usulan: Opsi B) | Hero |
| Q9 | "bekerja di" vs "berpengalaman di" IT Support | Hero |
| Q10 | Email/WA publik atau form saja | `/contact`, `/recruiter` |

Ditambah kolom ⚠️ di `00_CONTENT_INVENTORY.md` §1: kampus, tahun lulus,
lokasi, LinkedIn, GitHub, foto profil, berkas CV.

**Sementara Q10 belum dijawab,** kode memakai jalan tengah yang disarankan
dokumen itu sendiri: kontak langsung hanya di `/recruiter` yang ber-`noindex`,
selebihnya lewat form.

---

## N7 — Tiga bagian naratif menunggu isi pemilik

"Kenapa Bekerja dengan Saya", "Cara Saya Menangani Masalah", dan "Perjalanan
Saya" berisi klaim tentang cara kerja pemilik. Teksnya **tidak boleh** ditulis
developer (CLAUDE.md aturan mutlak §1), jadi dibaca dari `SiteSetting` dengan
kunci `home.whyWorkWithMe`, `home.troubleshootingProcess`, dan `about.story`.

Tanpa data, bagiannya tidak dirender sama sekali.

**Selesai di 3b:** halaman `/admin/narrative` mengisi ketiganya. Formatnya
teks sederhana — satu blok per paragraf, judul dan isi dipisah `|` pertama —
karena editor kaya (Tiptap) baru masuk Fase 5 dan tiga bagian ini tidak
sebanding dengan menarik dependency editor lebih awal.

Parser dan pemasang blok ada di `src/lib/narrative-format.ts`, terpisah dari
berkas `'use server'` karena berkas server action hanya boleh mengekspor
fungsi async — helper murni di sana tidak bisa diekspor, dan yang tidak bisa
diekspor tidak bisa diuji. 12 tes menutupinya.

Bahasa Inggris boleh dikosongkan seluruhnya, tapi tidak boleh separuh: jumlah
blok yang tidak sama ditolak, karena memasangkan berdasarkan urutan akan
menempelkan terjemahan ke blok yang keliru.

---

## N8 — Dua komentar berisi token asing (SELESAI)

`src/lib/i18n-content.ts` baris 37 dan `src/lib/env.ts` baris 53 sama-sama
diawali `// ponytail:` — kata yang tidak berhubungan sama sekali dengan isi
komentarnya, kemungkinan artefak alat. Diganti `// Catatan:`.

Layak disebut karena polanya identik di dua berkas: ada kemungkinan artefak
serupa menyelinap di tempat lain. Pencarian `ponytail` di seluruh repo sekarang
tidak menemukan sisa.

---

## N9 — `next lint` deprecated (diwarisi dari Fase 2)

Akan dihapus di Next.js 16. Migrasi: `npx @next/codemod@canary
next-lint-to-eslint-cli .` Belum menghambat apa pun; dikerjakan saat naik ke
Next 16.

**SELESAI.** Lihat catatan yang sama di `docs/phase-2/NOTES.md`.

---

## N10 — `.next` dipakai bersama dev dan build produksi

Saat verifikasi 3a, `npm run build` menimpa `.next` milik `next dev` yang
sedang berjalan di port 3000, dan keduanya rusak (`Cannot find module
'./vendor-chunks/...'`).

Bukan bug aplikasi — perilaku normal Next.js. Tapi perlu diingat: **hentikan
dev server sebelum menjalankan `npm run build`**, atau `rm -rf .next` lalu
mulai ulang dev server setelahnya.

---

## N11 — Sesi tidak valid menghasilkan 500, bukan redirect (SELESAI)

Middleware hanya memeriksa **keberadaan** cookie sesi — ia berjalan di Edge
dan tidak bisa memakai Prisma. Cookie yang kedaluwarsa atau dipalsukan lolos
lapisan itu, lalu `requireAdmin()` melempar `UNAUTHORIZED` di halaman dan
berakhir sebagai layar 500.

Tidak ada kebocoran data — tidak ada satu byte pun isi admin yang terkirim —
tapi 500 adalah pesan yang salah untuk "sesi Anda habis".

**Perbaikan:** `requireAdminPage()` di `src/data/_guards.ts`, mengalihkan ke
`/admin/login` alih-alih melempar. Seluruh fungsi `getAdmin*` memakainya.
Server action tetap memakai `requireAdmin()` yang melempar — action perlu
mengembalikan pesan ke form, bukan mengalihkan halaman.

Terverifikasi dengan tiga kondisi: tanpa cookie → 307, cookie palsu → 307,
sesi sah → 200.

---

## N12 — `unstable_cache` bertahan antar-build 🔴 PERHATIKAN SAAT DEPLOY

Saat menguji bagian naratif: data sudah ada di database, build berhasil, tapi
bagiannya tetap tidak muncul di beranda. Setelah `rm -rf` direktori build,
barulah muncul.

**Sebab:** entri `unstable_cache` disimpan di `<distDir>/cache` dan **dipakai
ulang oleh build berikutnya**. Build kedua menyajikan hasil kosong yang
di-cache build pertama, bukan membaca ulang database.

**Dampak saat produksi:** Vercel memulihkan cache build antar-deploy. Konten
yang ditambahkan lewat admin bisa tidak muncul setelah deploy sampai cache
dibersihkan.

**Penanganan saat ini:** mutasi admin memanggil `revalidateTag()`, yang
menangani kasus runtime. Yang belum ditangani adalah build baru yang memulihkan
cache lama.

**Perlu diputuskan di Fase 3.5:** bersihkan cache build saat deploy, atau
tinggalkan `unstable_cache` untuk data yang dikelola CMS. Terkait dengan N5.

---

## N13 — Aturan ESLint `next/link` terlalu luas (SELESAI)

`.eslintrc.json` melarang `next/link` di seluruh repositori dengan alasan
"rute harus selalu berawalan locale". Itu benar untuk rute publik, tapi rute
admin **tidak** berawalan locale (`05_ROUTE_AND_PRIORITY_MAP.md` §3) — memakai
`Link` dari `@/i18n/navigation` di sana justru menghasilkan `/id/admin/...`

**Perbaikan:** aturannya dibalik lewat `overrides` untuk
`src/app/admin/**`, `src/components/admin/**`, dan `src/middleware.ts`: di
sana yang dilarang justru `@/i18n/navigation`. Jadi kedua sisi tetap dijaga
lint, tidak ada yang dimatikan dengan komentar `eslint-disable`.

---

## N14 — `distDir` terpisah untuk verifikasi

`next dev` dan `next build` berbagi `.next` dan saling menimpa. Selama Fase 3
ini menyebabkan dev server dan build produksi rusak bergantian dengan galat
`Cannot find module './vendor-chunks/...'` (lihat N10).

`next.config.ts` sekarang membaca `NEXT_DIST_DIR`, default tetap `.next`:

```bash
NEXT_DIST_DIR=.next-verify npm run build
NEXT_DIST_DIR=.next-verify PORT=5322 npm start
```

CI dan produksi tidak berubah. `.next-verify` masuk `.gitignore`.

---

## N15 — Belum ada `AuditLog` pada mutasi admin

`06_SECURITY.md` §8 dan `07_DATA_PRISMA.md` §7 menyebut `AuditLog` mencatat
aksi. Tabelnya sudah ada di skema, tapi belum ada satu pun mutasi 3b yang
menulis ke sana.

**Sengaja ditunda:** "Audit logs" adalah deliverable Fase 5, dan disiplin fase
melarang mengerjakannya lebih awal. Dicatat di sini supaya tidak terlupa saat
Fase 5 dimulai.

---

## N16 — Kiriman form kontak belum diuji lewat HTTP sungguhan

Payload server action Next.js berformat internal (`Next-Action` header +
penomoran field) dan tidak bisa dirakit dengan `curl` — upaya melakukannya
menghasilkan 500.

**Yang sudah diverifikasi terpisah:** skema Zod (8 tes), jalur simpan ke
database, dan penghitung rate limit per email.

**Yang belum:** mengirim form dari peramban sungguhan. Berlaku juga untuk
seluruh form admin di 3b — semuanya memakai mekanisme server action yang sama.
**Wajib dicoba manual sebelum Fase 3.5.**

---

## N17 — Authenticated bukan berarti admin (SELESAI) 🔴

Audit setelah 3b menemukan `requireAdmin()` dan `requireAdminPage()` hanya
memeriksa keberadaan sesi. Akun Better Auth dengan role `user` dapat melewati
guard tersebut. Selain itu, registrasi email/password publik belum dimatikan
eksplisit; `autoSignIn: false` hanya mencegah login otomatis setelah daftar.

**Perbaikan:** `disableSignUp: true`, pemeriksaan role tepat `admin`, guard
langsung pada setiap server action, dan `AdminShell` memakai guard halaman
terpusat. Tes menutup kondisi tanpa sesi, role `user`, dan role `admin` pada
guard action maupun halaman.

**Verifikasi produksi:** login tetap 200; admin tanpa sesi dan cookie palsu
307 ke login; endpoint daftar membalas 400
`EMAIL_PASSWORD_SIGN_UP_DISABLED`.

---

## N18 — Overflow hero dan cetak tema gelap (SELESAI)

Gate manual menemukan dua regresi yang tidak tertangkap lint/test/build:

- item grid hero mempertahankan intrinsic width pada viewport 375 px;
- selector `[data-theme='dark']` mengalahkan token `:root` di `@media print`,
  sehingga Recruiter Mode tetap berlatar gelap saat dicetak.

**Perbaikan:** `min-w-0` pada grid/wrapper hero dan selector print
`:root, [data-theme]`. Terverifikasi 375 px tanpa elemen melewati viewport;
hasil cetak putih/hitam dan shell non-konten tersembunyi.
