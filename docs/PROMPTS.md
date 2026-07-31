# PROMPT PENUGASAN

Prompt untuk menugaskan pengerjaan per fase.
**Menggantikan** `03_CODEX_PROMPTS.md` — berkas lama belum memuat keputusan fase-0 dan folder aturan.

---

## Cara pakai

1. Setiap sesi baru: tempel **Prompt Global** dulu.
2. Lalu tempel **prompt fase** yang sedang dikerjakan.
3. Developer mengajukan rencana → **Anda menyetujui** → developer mulai menulis kode.
4. Selesai → tempel **Prompt Pemeriksaan**.
5. Ada temuan → tempel **Prompt Perbaikan**.

**Jangan menempelkan isi dokumen ke dalam prompt.** Suruh developer membacanya sendiri dari repositori. Isi yang ditempel akan basi begitu dokumennya diperbarui.

Untuk developer manusia, teks yang sama berfungsi sebagai surat perintah kerja.

---

## 1. Prompt Global

Tempel di awal **setiap** sesi baru, sebelum prompt fase.

```text
Kamu mengerjakan proyek "Muhammad Sya'ban Alfain — IT Support Portfolio & Knowledge Base".

LANGKAH PERTAMA, sebelum menjawab apa pun:
Baca berkas berikut dari repositori. Jangan menebak isinya.
1. CLAUDE.md
2. README.md                          (untuk tahu fase yang sedang berjalan)
3. docs/rules/README.md
4. docs/rules/00_WORKFLOW.md
5. docs/rules/01_CODE_CONVENTIONS.md
6. docs/rules/09_DEFINITION_OF_DONE.md

Buka berkas aturan lain sesuai kebutuhan saat mengerjakan.

SUMBER KEBENARAN bila dokumen bertentangan:
1. docs/phase-0/*    (keputusan yang sudah disetujui — mengalahkan PRD)
2. docs/rules/*
3. docs/00_MASTER_PRD.md
Contoh: docs/phase-0/07_SCHEMA_DECISIONS.md mengalahkan docs/04_DATABASE_DRAFT.prisma.

LIMA ATURAN MUTLAK:
1. Jangan mengarang fakta. Tidak ada angka pengalaman, jumlah tiket, jumlah
   pengguna, testimoni, atau sertifikat tanpa sumber. Butuh data dan tidak
   punya? Tanya. Jangan mengisi contoh yang terlihat masuk akal.
2. Jangan menerbitkan data sensitif. Tidak ada password, token, API key, IP
   publik, nama perusahaan tanpa izin, atau konfigurasi produksi — termasuk
   di komentar, berkas tes, dan data seed.
3. Jangan lompat fase. Kerjakan hanya fase yang sedang berjalan.
4. Jangan menulis teks langsung di JSX pada rute publik. Semua lewat kunci
   terjemahan, dan wajib ada di messages/id.json DAN messages/en.json.
5. Jangan menyalin aset, teks, atau struktur tata letak dari situs mana pun.

CARA KERJA:
- Sebelum menulis kode, ajukan rencana: daftar berkas yang akan dibuat,
  dependency yang akan dipasang, dan risiko yang terlihat. Lalu BERHENTI
  dan tunggu persetujuan saya.
- Setelah disetujui, kerjakan dengan commit kecil sesuai
  docs/rules/08_GIT_AND_PR.md.
- Menemukan masalah di luar cakupan fase: catat di docs/phase-N/NOTES.md,
  jangan dikerjakan.
- Butuh dependency yang tidak ada di rencana: berhenti dan tanya.

SELALU TANYA, JANGAN PERNAH MENEBAK, untuk:
- data pribadi pemilik, nama perusahaan, atau angka apa pun
- apakah suatu bukti boleh dipublikasikan
- perubahan skema database
- migrasi yang menghapus kolom atau tabel
- dependency baru

SEBELUM MENYATAKAN SELESAI, jalankan dan pastikan lolos:
npm run lint, npm run typecheck, npm run test, npm run build
Ditambah 8 pemeriksaan manual di docs/rules/09_DEFINITION_OF_DONE.md:
/id, /en, tema terang, tema gelap (hard reload), 375 px, 1440 px,
navigasi keyboard, reduced motion.

LAPORAN PENUTUP wajib memuat: berkas yang berubah, perintah yang dijalankan,
migrasi, env var baru, dependency yang ditambah, keterbatasan yang tersisa,
dan yang dibutuhkan untuk fase berikutnya.

Jangan menyatakan sesuatu selesai kalau belum benar-benar diperiksa.
Kalau ada gerbang yang gagal, laporkan apa adanya beserta keluarannya.
```

---

## 2. Prompt per fase

Tempel setelah Prompt Global.

### Fase 1 — Fondasi

```text
Kerjakan Fase 1 saja.

Baca dulu: docs/01_PHASES.md bagian Fase 1,
docs/phase-0/07_SCHEMA_DECISIONS.md, docs/phase-0/08_I18N_FALLBACK_POLICY.md.

Bangun: project Next.js App Router (TypeScript strict), token Tailwind dari
docs/02_DESIGN_AND_DATA.md, next-intl dengan rute /id dan /en, tema
terang/gelap tanpa flash, PostgreSQL + Prisma dengan skema dari
docs/phase-0/07_SCHEMA_DECISIONS.md, Better Auth login admin saja, validasi
environment dengan Zod, berkas loading/error/not-found/global-error, serta
fondasi Vitest dan CI.

JANGAN bangun: navbar, footer, hero, homepage, halaman konten, CRUD admin,
Tiptap, R2, Resend, Turnstile, animasi. Halaman /id dan /en cukup berisi
placeholder plus tombol ganti bahasa dan tema untuk membuktikan fondasi jalan.

Catatan penting:
- Jalankan `npx @better-auth/cli generate` dan verifikasi bentuk tabel auth
  terhadap versi yang benar-benar terpasang. Skema di dokumen adalah perkiraan.
- Neon butuh DATABASE_URL (pooled) dan DIRECT_URL (langsung, untuk migrasi).
- <html lang> ada di app/[locale]/layout.tsx, bukan di root layout.
- Prisma butuh pola singleton agar hot reload tidak menghabiskan koneksi.
- Skrip seed dijalankan dengan tsx, bukan ts-node (Windows).
- BETTER_AUTH_SECRET dan ADMIN_PASSWORD diisi pemilik di .env.local.
  Jangan membuat, menebak, atau menuliskan nilainya di mana pun.

Kriteria lolos: / mengarah ke /id; /id dan /en render; ganti bahasa dan tema
berfungsi; login admin berhasil; tidak ada endpoint registrasi yang bisa
diakses (buktikan dengan tes); migrate, lint, typecheck, test, dan build lolos.
```

### Fase 2 — Design system & shell

```text
Kerjakan Fase 2 saja.

Baca dulu: docs/01_PHASES.md bagian Fase 2, docs/02_DESIGN_AND_DATA.md,
docs/rules/02_STYLING.md, docs/rules/04_MOTION.md,
docs/rules/05_ACCESSIBILITY.md.

Bangun: token tipografi/jarak/radius/bayangan/motion, navbar dengan
transformasi saat scroll, drawer mobile yang accessible, footer, primitif UI
(Button, Card, Badge, Input, Dialog, Skeleton, EmptyState, ErrorState), serta
utilitas motion (Reveal, StaggerGroup, HoverLift, PageTransition).

JANGAN bangun halaman berisi konten. Buat satu halaman peraga internal untuk
memperlihatkan seluruh komponen dalam dua tema dan dua bahasa.

Aturan: Motion for React satu-satunya library animasi. Animasi CSS data-state
bawaan Radix diizinkan. Setiap animasi menghormati prefers-reduced-motion.
Hanya transform dan opacity yang dianimasikan. Tidak boleh ada layout shift
dari animasi masuk. Mobile tidak boleh bergantung pada hover.

Kriteria lolos: setiap komponen benar di 2 tema × 2 bahasa; fokus selalu
terlihat; reduced motion mematikan parallax dan gerakan berulang; tanpa scroll
horizontal di 375 px.
```

### Fase 3 — Portofolio & Recruiter Mode

```text
Kerjakan Fase 3 saja.

Baca dulu: docs/01_PHASES.md bagian Fase 3, docs/00_MASTER_PRD.md bab 9-10,
docs/phase-0/03_PROFILE_COPY.md, docs/phase-0/05_ROUTE_AND_PRIORITY_MAP.md.

Bangun: homepage 11 bagian sesuai urutan di docs/01_PHASES.md, About,
Experience, Projects + studi kasus, Expertise, Certifications, Contact,
Recruiter Mode yang bisa dicetak, unduh CV, panel Explore My Work, dan admin
CRUD untuk profil, pengalaman, skill, proyek, sertifikat, serta pesan kontak.

PENTING soal konten:
- Semua copy diambil dari docs/phase-0/03_PROFILE_COPY.md.
- Field bertanda [PERLU DIISI] TIDAK BOLEH kamu isi. Pakai placeholder yang
  jelas terlihat kosong, dan daftarkan di laporan penutup.
- Bagian "Ringkasan" hanya menampilkan metrik yang benar-benar ada datanya.
  Metrik tanpa sumber TIDAK diisi tebakan — kartunya dihapus. Rancang bagian
  itu agar rapi dengan 3 maupun 6 kartu.
- Tautan Knowledge Base disembunyikan lewat flag, karena rutenya baru ada di
  Fase 4. Jangan biarkan mengarah ke 404.

Form kontak: honeypot + Turnstile diverifikasi di server + rate limit +
validasi Zod di server. Jangan simpan IP pengunjung mentah.

Kriteria lolos: kecocokan pekerjaan terbaca di bawah 2 menit; 3 proyek publik;
form kontak dan unduh CV berfungsi; Recruiter Mode rapi saat dicetak.
```

### Fase 3.5 — Deploy

```text
Kerjakan Fase 3.5 saja.

Tujuan: situs live sehingga URL-nya bisa dicantumkan di CV.

Bangun: deployment produksi, domain dan HTTPS, database produksi, variabel
environment produksi, robots.txt yang memblokir /admin, sitemap.xml yang
mematuhi docs/phase-0/08_I18N_FALLBACK_POLICY.md, security header dan CSP,
serta satu smoke test Playwright.

Aturan sitemap dan hreflang:
- URL /en hanya dimasukkan ke sitemap bila bahasa Inggrisnya lengkap.
- Jangan memancarkan hreflang="en" untuk halaman yang isinya bahasa Indonesia.
- Halaman /en yang belum lengkap memakai canonical ke padanan /id.

JANGAN bangun fitur baru. Fase ini murni penerbitan.

Kriteria lolos: situs bisa diakses lewat HTTPS; /admin diblokir robots.txt;
sitemap valid; tidak ada rahasia di bundel klien; smoke test lolos.
Laporkan URL-nya.
```

### Fase 4 — Knowledge Base publik

```text
Kerjakan Fase 4 saja.

Baca dulu: docs/01_PHASES.md bagian Fase 4, docs/00_MASTER_PRD.md bab 11,
docs/phase-0/04_SEED_CONTENT_DRAFT.md, docs/rules/07_DATA_PRISMA.md.

Bangun: halaman landing KB, listing dan detail untuk SOP/LAB/INCIDENT/ARTICLE,
halaman kategori dan tag, pencarian dan filter dengan state di URL, sticky TOC,
progress scroll, galeri bukti dengan lightbox, tombol salin blok kode, linimasa
revisi, dan SEO terlokalisasi.

Konten berasal dari content/**/*.json lewat prisma/seed.ts. Format berkas ada
di docs/phase-0/04_SEED_CONTENT_DRAFT.md — format yang sama akan dipakai
sebagai ekspor backup di Fase 5, jadi ikuti persis. Seed harus idempoten.

KEAMANAN — ini yang paling penting di fase ini:
- Setiap query publik menyaring status: 'PUBLISHED'. Query tanpa filter itu
  adalah kebocoran data, bukan bug tampilan.
- Dokumen draft menghasilkan 404, BUKAN 403.
- Render dari contentIdJson lewat renderer React di server. Dilarang
  dangerouslySetInnerHTML. Kolom HTML hanya untuk indeks pencarian.

Kriteria lolos: draft tidak bisa diakses publik (buktikan dengan tes); state
filter ada di URL dan bisa dibagikan; tabel lebar bisa di-scroll dengan
keyboard di mobile.
```

### Fase 5 — Admin CMS

```text
Kerjakan Fase 5 saja.

Baca dulu: docs/01_PHASES.md bagian Fase 5, docs/00_MASTER_PRD.md bab 12,
docs/phase-0/01_ASSET_CLASSIFICATION.md, docs/phase-0/02_REDACTION_CHECKLIST.md.

Bangun: dashboard admin, CRUD KnowledgeDocument terpadu, editor Tiptap dengan
template per tipe dokumen, autosave dan pemulihan lokal, pratinjau ID/EN, alur
publish/archive, riwayat revisi, pustaka MediaAsset dengan unggah drag-and-drop,
kategori dan tag, audit log, serta ekspor JSON/Markdown.

Aturan wajib:
- Tiptap dimuat dinamis dan TIDAK BOLEH masuk bundel publik. Verifikasi lewat
  analisis bundle, jangan hanya diasumsikan.
- Ekspor backup memakai format yang sama dengan content/**/*.json di Fase 4.
- Aset baru default isPublic = false.
- Perpindahan aset ke publik butuh dialog konfirmasi berisi checklist dari
  docs/phase-0/02_REDACTION_CHECKLIST.md, menulis redactionConfirmed = true,
  dan mencatat AuditLog.
- Menerbitkan atau menyunting dokumen terbit membuat revisi. Bungkus dalam
  satu transaksi bersama audit log.
- Dokumen tidak bisa berpindah ke PUBLISHED tanpa bahasa Indonesia lengkap.
  Bahasa Inggris tidak pernah menghalangi penerbitan.
- Antarmuka admin hanya bahasa Indonesia. Field konten tetap bilingual.
- Setiap server action memanggil requireAdmin() di baris pertama.

Kriteria lolos: setiap tipe dokumen bisa dibuat, dipratinjau, dan diterbitkan;
draft tetap privat; menyunting dokumen terbit membuat revisi; konfirmasi
redaksi benar-benar ditegakkan, bukan sekadar ditampilkan.
```

### Fase 6 — Blok teknis terstruktur

```text
Kerjakan Fase 6 saja.

Baca dulu: docs/01_PHASES.md bagian Fase 6, docs/00_MASTER_PRD.md bab 11.

Bangun blok terstruktur untuk lab PNETLab (topologi, inventaris perangkat dan
interface, rencana IP dan VLAN, blok konfigurasi dan perintah, test case,
simulasi gangguan, hasil aktual vs harapan, unduhan tersanitasi) dan untuk
insiden (nomor, prioritas/dampak/urgensi, layanan terdampak, linimasa, log
troubleshooting, RCA, workaround, resolusi, validasi, pencegahan, SOP terkait).

Aturan wajib:
- Setiap dokumen insiden punya metadata.isLabReproduction. Bila true, tampilkan
  penanda yang terlihat di bagian atas halaman dalam dua bahasa, sesuai
  docs/phase-0/02_REDACTION_CHECKLIST.md bagian H. Ini bukan opsional.
- Berkas asli tetap privat, hanya versi tersanitasi yang publik.
- Alamat IP hanya dari rentang privat atau rentang dokumentasi RFC 5737.
- Tabel teknis harus bisa dipakai di layar 375 px dan bisa di-scroll dengan
  keyboard.

Kriteria lolos: satu lab dan satu insiden lengkap; berkas publik sudah
disanitasi; bukti privat dan publik terpisah dengan jelas.
```

### Fase 7 — Pencarian, analitik, SEO

```text
Kerjakan Fase 7 saja.

Bangun: pencarian full-text PostgreSQL, command palette dengan dukungan
keyboard penuh, analitik yang menghormati privasi, gambar Open Graph dinamis,
data terstruktur, RSS, peringkat konten terkait, dan (opsional) passkey/2FA
untuk admin.

Catatan penting:
- Verifikasi dulu apakah instance Postgres punya konfigurasi teks 'indonesian'
  (cek \dF). Kalau tidak ada, pakai 'simple' + ekstensi unaccent + pg_trgm.
  Laporkan mana yang dipakai.
- Analitik tidak menyimpan IP pengunjung mentah.
- viewCount masuk di sini sebagai tabel terpisah yang ditulis async. JANGAN
  menambahkan increment saat render — itu akan memaksa halaman menjadi dinamis
  dan merusak target LCP.
- JANGAN menambahkan pencarian AI atau vector search. Itu ditunda.

Kriteria lolos: pencarian menemukan istilah Indonesia dan Inggris; command
palette bisa dipakai sepenuhnya lewat keyboard; Core Web Vitals tidak turun.
```

### Fase 8 — QA, keamanan, performa

```text
Kerjakan Fase 8 saja.

Baca dulu: docs/rules/06_SECURITY.md, docs/00_MASTER_PRD.md bab 17-18.

Kerjakan: tes unit/komponen/otorisasi/E2E; tinjauan keamanan untuk auth,
sanitasi HTML, unggahan, signed URL, rate limit, CSP, rahasia, dan dependency;
tinjauan performa untuk bundle, gambar, animasi, query, cache, dan Core Web
Vitals; indeks database; serta prosedur backup dan rollback.

Perbaiki setiap masalah kritis yang ditemukan. Laporkan yang tidak kamu
perbaiki beserta alasannya — jangan diam-diam dilewati.

Uji otorisasi secara eksplisit: coba akses dokumen draft tanpa sesi, coba
panggil server action tanpa sesi, coba akses berkas privat tanpa signed URL.
Ketiganya harus gagal.

Kriteria lolos: build produksi lolos; E2E kritis lolos; draft tidak bisa
diakses tanpa otorisasi; npm audit bersih dari severity tinggi; backup dan
rollback terdokumentasi.
```

### Fase 9 — Konten peluncuran

```text
Kerjakan Fase 9 saja.

Masukkan konten peluncuran dari materi yang SAYA sediakan. Periksa kualitas
bilingual, redaksi bukti, SEO, tautan, CV, kontak, dan analitik.

ATURAN PALING PENTING di fase ini:
- Jangan menulis pengalaman, pencapaian, angka, atau sertifikat apa pun yang
  tidak saya berikan. Kalau ada slot kosong, laporkan sebagai slot kosong.
- Setiap bukti harus lolos docs/phase-0/02_REDACTION_CHECKLIST.md sebelum
  diterbitkan. Kalau ragu terhadap sebuah aset, biarkan privat dan tanyakan.

Target: profil dan pengalaman lengkap, 3 studi kasus proyek, 3 SOP, 3 lab,
2 laporan insiden, 1 sertifikat terverifikasi, CV, kontak, UI Indonesia
lengkap, dan halaman kunci berbahasa Inggris.

Kriteria lolos: tidak ada data yang dikarang; tidak ada data rahasia yang
publik; semua tautan hidup.
```

---

## 3. Prompt melanjutkan fase yang tertunda

Saat sesi terputus di tengah fase:

```text
Lanjutkan Fase N. Sesi sebelumnya terputus.

Sebelum menulis kode:
1. Baca docs/phase-N/README.md dan NOTES.md kalau ada.
2. Periksa `git log --oneline -15` dan `git status`.
3. Jalankan npm run typecheck dan npm run build untuk tahu kondisi sekarang.
4. Laporkan: apa yang sudah selesai, apa yang belum, dan apa langkah
   berikutnya. Lalu BERHENTI dan tunggu persetujuan.

Jangan mengulang pekerjaan yang sudah ada. Jangan merombak yang sudah jalan.
```

---

## 4. Prompt pemeriksaan

Tempel setelah developer menyatakan fase selesai. Bisa dijalankan di sesi terpisah agar penilaiannya jujur.

```text
Periksa hasil Fase N. Kamu bertugas sebagai pemeriksa, bukan pelaksana.
JANGAN memperbaiki apa pun. Laporkan temuan saja.

Baca docs/rules/09_DEFINITION_OF_DONE.md, lalu verifikasi:

GERBANG OTOMATIS — jalankan sendiri, jangan percaya laporan:
  npm run lint, npm run typecheck, npm run test, npm run build

GERBANG ISI KODE — periksa dengan pencarian, bukan asumsi:
  - Teks langsung di JSX pada rute publik
  - Warna hex atau kelas warna Tailwind bawaan
  - console.log, any, @ts-ignore, atau ! tanpa alasan tertulis
  - Query publik tanpa filter status: 'PUBLISHED'   ← paling kritis
  - Server action tanpa requireAdmin() di baris pertama
  - import Link from 'next/link' (harusnya dari @/i18n/navigation)
  - dangerouslySetInnerHTML di rute publik
  - Rahasia di kode, tes, atau data seed
  - Kunci terjemahan yang hanya ada di salah satu berkas messages
  - Dependency baru di luar rencana fase (bandingkan git diff package.json)

CAKUPAN:
  - Adakah pekerjaan fase lain yang ikut dikerjakan?
  - Adakah kode fase sebelumnya yang dirombak tanpa diminta?

KEJUJURAN:
  - Adakah angka, pencapaian, atau data pribadi yang dikarang?
  - Adakah data sensitif yang bocor ke konten publik?

Laporkan dalam bentuk daftar temuan, diurutkan dari yang paling parah, masing
masing dengan lokasi berkas dan barisnya. Kalau semuanya bersih, katakan bersih
— jangan mencari-cari masalah yang tidak ada.

Delapan pemeriksaan manual (2 bahasa × 2 tema × 2 ukuran layar, keyboard,
reduced motion) saya lakukan sendiri.
```

---

## 5. Prompt perbaikan

```text
Berikut temuan pemeriksaan Fase N:

[tempel daftar temuan]

Perbaiki seluruhnya. Aturan:
- Perbaiki penyebabnya, jangan menutupinya. Dilarang mematikan aturan ESLint
  atau menambah @ts-ignore agar gerbang hijau.
- Satu commit per kelompok temuan yang berkaitan.
- Tidak setuju dengan sebuah temuan? Katakan beserta alasannya, jangan
  diam-diam dilewati.
- Setelah selesai, jalankan ulang keempat gerbang dan laporkan hasilnya.

Jangan mengerjakan apa pun di luar daftar temuan ini.
```

---

## 6. Prompt saat ada yang salah arah

```text
Berhenti. Jangan lanjutkan.

[jelaskan apa yang salah]

Jangan memperbaiki dulu. Jelaskan lebih dulu:
1. Kenapa kamu mengambil pendekatan itu
2. Berkas apa saja yang sudah terpengaruh
3. Apa yang perlu dibatalkan
4. Usulan pendekatan yang benar

Setelah itu berhenti dan tunggu keputusan saya.
```

---

## 7. Kesalahan umum saat memberi prompt

| ❌ | ✅ |
|---|---|
| "Kerjakan sampai selesai" | Satu fase per penugasan |
| Menempelkan isi PRD ke prompt | Suruh baca dari repositori |
| "Sekalian tambahkan fitur X" | Catat untuk fase berikutnya |
| Menyetujui rencana tanpa membacanya | Rencana yang salah arah lebih murah diperbaiki di paragraf |
| Percaya "sudah saya cek semua" | Jalankan Prompt Pemeriksaan |
| Memeriksa di sesi yang sama dengan pengerjaan | Sesi terpisah menghasilkan penilaian lebih jujur |
| Memberikan nilai rahasia lewat chat | Pemilik mengisinya sendiri di `.env.local` |
