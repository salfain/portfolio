# FASE 3 — PORTOFOLIO INTI & RECRUITER MODE

**Status:** 🟡 kode 3a & 3b + hardening + gate visual selesai — menunggu
konten, perlindungan kontak, dan uji pengiriman form
**Tanggal mulai:** 31 Juli 2026
**Tanggal selesai kode:** 1 Agustus 2026

Fase 3 dipecah dua langkah supaya bisa ditinjau lebih awal:

| Langkah | Cakupan | Status |
|---|---|---|
| **3a** | Lapisan data + seluruh halaman publik | ✅ Selesai |
| **3b** | Guard middleware admin + admin CRUD + `/admin/messages` | ✅ Kode selesai; uji form tertunda |

---

## 3a — Yang dibuat

### Lapisan data (`src/data/`)

Seluruhnya `import 'server-only'`, memakai `select` eksplisit, dan menyaring
`status: 'PUBLISHED'` pada setiap query publik.

| Berkas | Isi |
|---|---|
| `profile.ts` | `getPublishedProfile`, `getRecruiterProfile` — dua bentuk `select` berbeda |
| `experience.ts` | `getPublishedExperiences`, `toAchievements` (normalisasi `Json?` → `string[]`) |
| `project.ts` | `getPublishedProjects`, `getFeaturedProjects`, `getPublishedProjectBySlug`, `getPublishedProjectSlugs` |
| `skill.ts` | `getPublishedSkills`, `groupSkillsByCategory` |
| `certificate.ts` | `getPublishedCertificates` |
| `stats.ts` | `getCareerStats` — seluruh angka dihitung dari database |
| `settings.ts` | `getNarrativeSection` — bagian naratif dari `SiteSetting`, divalidasi Zod |
| `contact.ts` | `createContactMessage`, `countRecentMessagesFrom` |

**Pemisahan kontak yang disengaja:** `publicProfileSelect` **tidak** memuat
`email`, `phone`, dan `whatsapp`. Hanya `recruiterProfileSelect` yang memuatnya,
dan hanya dipakai `/[locale]/recruiter` yang ber-`noindex`. Q10 belum dijawab,
jadi default paling aman yang dipakai.

### Rute publik (11 halaman × 2 locale = 26 halaman statis)

`/`, `/about`, `/experience`, `/projects`, `/projects/[slug]`, `/expertise`,
`/certifications`, `/recruiter`, `/contact`, `/privacy`, `/terms`.

Urutan 11 bagian homepage mengikuti `01_PHASES.md`. Bagian 10 (pratinjau
Knowledge Base) belum ada — dibuat di Fase 4.

### Komponen baru

- `src/components/sections/` — 9 bagian + kerangka `Section`
- `src/components/layout/container.tsx`, `page-header.tsx`, `nav-items.ts`
- `src/components/project-card.tsx`, `contact-form.tsx`, `print-button.tsx`,
  `translation-notice.tsx`

### Utilitas

- `src/lib/features.ts` — flag `knowledgeBase: false`
- `src/lib/format.ts` — tanggal & periode, zona waktu tetap `Asia/Jakarta`
- `src/lib/schemas/contact.ts`, `src/lib/schemas/site-settings.ts`
- `resolveLocalized()` di `src/lib/i18n-content.ts` — mengembalikan nilai
  **beserta bahasanya**, untuk atribut `lang` (WCAG 3.1.2)

---

## Kebijakan konten yang ditegakkan di kode

Q4–Q10 di `docs/phase-0/06_OPEN_QUESTIONS.md` belum dijawab. Tidak ada satu pun
fakta yang dikarang untuk menutupinya:

| Yang butuh data pemilik | Perilaku tanpa data |
|---|---|
| Profil, pengalaman, keahlian, sertifikat, proyek | Empty state, bukan isi karangan |
| "Kenapa Bekerja dengan Saya" | Bagian **tidak dirender sama sekali** |
| "Cara Saya Menangani Masalah" | Bagian **tidak dirender sama sekali** |
| "Perjalanan Saya" di `/about` | Bagian **tidak dirender sama sekali** |
| Metrik di "Ringkasan" | Hanya angka hasil hitung database; kartu bernilai 0 disembunyikan |
| Tombol Unduh CV | Hanya muncul bila `cvIdUrl` / `cvEnUrl` terisi |
| Penanda sertifikat terverifikasi | Hanya bila `credentialUrl` terisi |

Satu-satunya teks profil yang dipakai sebagai fallback hero adalah kutipan
final dari PRD bab 1 dan `03_PROFILE_COPY.md` §1 & §3 — bukan karangan:

> IT Support profesional yang membantu pengguna, menyelesaikan masalah
> operasional, dan mendokumentasikan solusinya.

---

## Gates

| Gate | Hasil |
|---|---|
| lint | ✅ tanpa warning |
| typecheck | ✅ |
| test | ✅ 32/32 (naik dari 13) |
| build | ✅ 28/28 halaman |

Tes baru: `format.test.ts` (7), `schemas/contact.test.ts` (8),
`resolveLocalized` di `i18n-content.test.ts` (4).

---

## Verifikasi runtime

Dijalankan terhadap build produksi di port 5321, memakai dua proyek uji
sementara (`zz-uji-terbit` PUBLISHED, `zz-uji-draft` DRAFT) yang **sudah
dihapus** setelah pengujian.

| Yang diuji | Hasil |
|---|---|
| 11 rute publik × ID & EN | ✅ 200 |
| Proyek PUBLISHED | ✅ 200 |
| Proyek DRAFT | ✅ **404**, bukan 403, bukan 200 |
| Slug tidak ada | ✅ 404 |
| `/knowledge` (di balik flag) | ✅ 404, dan tidak ditaut dari mana pun |
| `generateStaticParams` | ✅ hanya slug PUBLISHED yang dibangun |
| `<html lang>` | ✅ `id` di `/id`, `en` di `/en` |
| Banner terjemahan di `/en` | ✅ `role="note"` muncul |
| `lang="id"` pada isi ID di halaman `/en` | ✅ |
| Canonical `/en` belum lengkap → `/id` | ✅ |
| Canonical `/id` → dirinya sendiri | ✅ |
| `/recruiter` | ✅ `noindex, follow` |
| Bagian naratif tanpa data | ✅ tidak dirender |
| Jalur simpan form kontak + penghitung rate limit | ✅ (diuji lewat lapisan data) |

**Belum diverifikasi:** pengiriman form kontak lewat HTTP sungguhan. Payload
server action Next.js berformat internal dan tidak bisa dirakit dengan `curl`.
Validasi dan jalur simpannya sudah diuji terpisah, tapi formnya **wajib dicoba
manual di browser** sebelum 3a dianggap tuntas.

---

## Uji manual delapan titik

Belum dijalankan — menunggu peninjauan pemilik. Delapan titik wajib:
ID · EN · terang · gelap (hard reload) · 375 px · 1440 px · keyboard ·
reduced motion. Tambahan untuk fase ini: **pratinjau cetak `/recruiter`**.

---

# 3b — Yang dibuat

## Guard admin (dua lapisan)

| Lapisan | Berkas | Sifat |
|---|---|---|
| Middleware | `src/middleware.ts` | Optimis — hanya cek keberadaan cookie. Edge tidak bisa memakai Prisma. |
| Halaman | `requireAdminPage()` di `src/data/_guards.ts` | Menentukan — sesi divalidasi ke database, gagal → redirect ke login |
| Server action | `requireAdmin()` di `src/data/_guards.ts` | Menentukan — gagal → melempar, action mengembalikan pesan ke form |

Setiap fungsi `getAdmin*` dan setiap mutasi memanggil guard-nya **di dalam
dirinya sendiri**, bukan bergantung pada pemanggil (`07_DATA_PRISMA.md` §2).

Menemukan N0 saat mengerjakan ini: middleware tidak pernah berjalan sejak
Fase 1 karena berkasnya salah tempat. Lihat NOTES.

## Rute admin (16)

`/admin` · `/admin/profile` · `/admin/experiences` (+ `new`, `[id]`) ·
`/admin/projects` (+ `new`, `[id]`) · `/admin/skills` (+ `new`, `[id]`) ·
`/admin/certifications` (+ `new`, `[id]`) · `/admin/narrative` ·
`/admin/messages` · `/admin/login`

Seluruhnya `force-dynamic` — dasbor admin tidak boleh menampilkan angka basi.

## Validasi

`src/lib/schemas/admin.ts` — satu skema Zod per entitas, pesan langsung dalam
bahasa Indonesia (antarmuka admin memang satu bahasa). Setiap string punya
`max()`.

Aturan yang ditegakkan skema:

- `SiteProfile` dan `Experience` **wajib** lengkap di kedua bahasa. Bukan
  kelalaian — `07_SCHEMA_DECISIONS.md` menetapkannya `String` (bukan `String?`)
  dan `08_I18N_FALLBACK_POLICY.md` §2 mencantumkannya sebagai field wajib EN.
  Aturan fallback bahasa hanya berlaku untuk `Project` dan `KnowledgeDocument`.
- Slug proyek diperiksa keunikannya sebelum menyentuh database, supaya
  bentrokan menunjuk field yang benar alih-alih muncul sebagai galat umum.
- Pengalaman: wajib punya tanggal selesai ATAU dicentang "masih berjalan";
  tanggal selesai tidak boleh mendahului tanggal mulai.
- `publishedAt` diisi sekali saat entri pertama kali terbit, lalu dibiarkan.

## Gates 3b

| Gate | Hasil |
|---|---|
| lint | ✅ tanpa warning |
| typecheck | ✅ |
| test | ✅ 43/43 (naik dari 32) |
| build | ✅ 25 halaman publik + 16 rute admin |

Tes baru: `narrative-format.test.ts` (11 tes untuk parser blok naratif).

## Verifikasi runtime 3b

Dijalankan terhadap build produksi di port 5322, memakai akun admin hasil seed.

| Kondisi | Hasil |
|---|---|
| Tanpa cookie → 9 rute admin | ✅ 307 ke `/admin/login` |
| Cookie palsu → 4 rute admin | ✅ 307 ke `/admin/login` (sebelum perbaikan: 500) |
| `/admin/login` tanpa sesi | ✅ 200 — tidak ikut terkunci |
| Login lewat API Better Auth | ✅ 200, cookie sesi diterbitkan |
| Sesi sah → 9 rute admin | ✅ 200 |
| Origin tidak cocok saat login | ✅ 403 `INVALID_ORIGIN` — proteksi CSRF bekerja |
| Simpan bagian naratif → tampil di beranda | ✅ ID & EN |
| Tiga kunci naratif tidak tertukar | ✅ masing-masing terisolasi |
| Bagian naratif yang masih kosong | ✅ tetap tidak dirender |

Seluruh data uji sudah dihapus — database kembali kosong di semua tabel isi.

**Belum diverifikasi:** pengiriman form dari peramban sungguhan (lihat NOTES
N16). Berlaku untuk form kontak publik maupun seluruh form admin.

---

## Hardening otorisasi — 1 Agustus 2026

Audit setelah 3b menemukan dua celah konfigurasi: registrasi email/password
masih memakai default Better Auth, dan guard menerima setiap pengguna yang
punya sesi tanpa memeriksa role. Perbaikan:

- registrasi publik dimatikan eksplisit dengan `disableSignUp: true`;
- `requireAdmin()` dan `requireAdminPage()` hanya menerima role `admin`;
- `AdminShell` memakai `requireAdminPage()` terpusat;
- setiap server action memanggil `requireAdmin()` sebelum membaca input;
- label honeypot dilokalkan dan warna cetak memakai token tema;
- tes kebijakan dan batas guard ditambahkan.

Verifikasi produksi terisolasi:

| Kondisi | Hasil |
|---|---|
| `/admin/login` tanpa sesi | ✅ 200 |
| halaman admin tanpa sesi | ✅ 307 ke `/admin/login` |
| halaman admin dengan cookie palsu | ✅ 307 ke `/admin/login` |
| registrasi email/password publik | ✅ 400 `EMAIL_PASSWORD_SIGN_UP_DISABLED` |

Gate terbaru: lint ✅ · typecheck ✅ · test ✅ **51/51** · build ✅ **25/25**.
Fase 3 belum dinyatakan selesai karena N3, N6, dan N16 masih menghambat.

## Gate visual terbaru

Build produksi diperiksa pada ID · EN · tema terang · tema gelap setelah hard
reload · 375 px · 1440 px · keyboard · reduced motion. Seluruhnya ✅.
Pratinjau cetak Recruiter Mode juga ✅: latar putih, teks hitam, header,
footer, dan tombol cetak disembunyikan.

Dua regresi ditemukan lalu diperbaiki selama pemeriksaan: intrinsic width hero
pada 375 px, serta token tema gelap yang mengalahkan token warna cetak.
