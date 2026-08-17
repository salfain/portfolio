# Panduan Proyek

Situs portofolio & Knowledge Base IT Support. Bilingual (`/id` · `/en`), tema terang/gelap, dibangun bertahap per fase.

**Berlaku untuk siapa pun yang menulis kode di repositori ini — manusia maupun agen AI.**

---

## Baca ini dulu

| Urutan | Dokumen |
|---|---|
| 1 | [docs/rules/README.md](docs/rules/README.md) — indeks aturan + 5 aturan mutlak |
| 2 | [docs/rules/00_WORKFLOW.md](docs/rules/00_WORKFLOW.md) — cara mengerjakan satu fase |
| 3 | [docs/rules/01_CODE_CONVENTIONS.md](docs/rules/01_CODE_CONVENTIONS.md) — konvensi kode |
| 4 | [docs/rules/09_DEFINITION_OF_DONE.md](docs/rules/09_DEFINITION_OF_DONE.md) — kapan disebut selesai |

Fase yang sedang berjalan ada di [README.md](README.md).

---

## Disiplin fase

```
0 ✅  1 ✅  2 ✅  3 ✅  3.5 🟡 DEPLOY  4 ✅  5 ✅  6 🟡 (struktur ✅ · konten ⬜)  7 ✅  8 🟡 (kode ✅ · rate limit & R2 ⬜)  9 ⬜
```

**Kerjakan hanya fase yang sedang berjalan.** Sebelum menulis kode: ajukan rencana (berkas, dependency, risiko) dan tunggu persetujuan.

Menemukan sesuatu di luar cakupan? Catat di `docs/phase-N/NOTES.md`, jangan dikerjakan.

---

## Lima aturan mutlak

1. **Jangan mengarang fakta** — tidak ada angka pengalaman, jumlah tiket, jumlah pengguna, testimoni, atau sertifikat tanpa sumber. Butuh data dan tidak punya? Tanya.
2. **Jangan menerbitkan data sensitif** — tidak ada password, token, API key, IP publik, nama perusahaan tanpa izin, atau konfigurasi produksi. Termasuk di komentar, tes, dan data seed.
3. **Jangan lompat fase.**
4. **Jangan menulis teks langsung di JSX pada rute publik** — semua lewat kunci terjemahan.
5. **Jangan menyalin dari situs referensi mana pun** — aset, teks, maupun struktur tata letak.

---

## Stack

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Framework | Next.js App Router | Server Components sebagai default |
| Bahasa | TypeScript strict | Dilarang `any` dan `@ts-ignore` |
| Styling | Tailwind + token CSS variable | Dilarang warna hex langsung |
| i18n | next-intl | `Link` selalu dari `@/i18n/navigation` |
| Animasi | Motion for React | Satu-satunya library animasi |
| Database | PostgreSQL + Prisma | Query hanya di `src/data/` |
| Auth | Better Auth | Admin saja, tanpa registrasi publik |
| Editor | Tiptap | Admin saja, dimuat dinamis |
| Storage | Cloudflare R2 | Default privat |
| Validasi | Zod | Server dan klien |

---

## Kesalahan yang paling sering terjadi

| ❌ | ✅ |
|---|---|
| `import Link from 'next/link'` | `import { Link } from '@/i18n/navigation'` |
| `className="text-blue-600"` | `className="text-primary"` |
| `'use client'` di `page.tsx` | Dorong ke komponen daun |
| `prisma.project.findMany()` di komponen | Fungsi di `src/data/` yang menyaring status |
| Query publik tanpa `status: 'PUBLISHED'` | Kebocoran data, bukan bug tampilan |
| `loading.tsx` di atas rute yang memanggil `notFound()` | `<Suspense>` di dalam halaman — boundary di atasnya membuat 404 terkirim sebagai 200 (fase-5 N1) |
| Server action tanpa `requireAdmin()` | Baris pertama, selalu |
| Kunci terjemahan hanya di `id.json` | Wajib di kedua berkas |
| Draft menghasilkan 403 | Harus 404 |
| Insiden tanpa `isLabReproduction` | Wajib dijawab — default apa pun mengarang asal insiden (fase-6 N1) |

---

## Gerbang wajib

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

Jalur kritis punya tes E2E tersendiri (butuh server yang berjalan dan
`npm run db:seed` sudah dijalankan):

```bash
E2E_BASE_URL=http://localhost:3000 npm run test:e2e
```

**Host-nya harus sama persis dengan `BETTER_AUTH_URL` di `.env.local`.**
Better Auth memeriksa header `Origin`, dan `localhost` dengan `127.0.0.1`
dianggap dua origin berbeda meski menunjuk mesin yang sama. Kalau tidak
cocok, login E2E gagal dan tiga tes yang butuh sesi admin tidak berjalan
sama sekali — hasilnya terbaca 22/23 lolos, bukan 26/26.

Plus delapan pemeriksaan manual: ID · EN · terang · gelap (hard reload) · 375 px · 1440 px · keyboard · reduced motion.

Detail: [docs/rules/09_DEFINITION_OF_DONE.md](docs/rules/09_DEFINITION_OF_DONE.md).

---

## Selalu tanya, jangan pernah menebak

- Data pribadi pemilik, nama perusahaan, angka apa pun
- Apakah suatu bukti boleh dipublikasikan
- Perubahan skema database
- Dependency baru di luar rencana fase
- Migrasi yang menghapus kolom atau tabel

Menebak pada lapisan fondasi menghasilkan pekerjaan ulang yang jauh lebih mahal daripada satu pertanyaan.

---

## Sumber kebenaran

Bila dokumen bertentangan, urutan yang berlaku:

1. `docs/phase-0/*` — keputusan yang sudah disetujui (mengalahkan PRD)
2. `docs/rules/*` — aturan pengembangan
3. `docs/00_MASTER_PRD.md` — PRD asli

Contoh: `docs/phase-0/07_SCHEMA_DECISIONS.md` mengalahkan `docs/04_DATABASE_DRAFT.prisma`.
