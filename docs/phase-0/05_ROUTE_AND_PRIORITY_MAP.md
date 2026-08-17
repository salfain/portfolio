# 05 — PETA RUTE & PRIORITAS

**Fase:** 0
**Catatan:** urutan fase sudah direvisi — deploy dilakukan pada **Fase 3.5**, bukan Fase 8 (lihat `README.md`).

---

## 1. Prioritas

| Tanda | Arti                                    |
| ----- | --------------------------------------- |
| **M** | Must — wajib ada saat go-live Fase 3.5  |
| **S** | Should — dibutuhkan agar produk lengkap |
| **L** | Later — setelah rilis                   |

---

## 2. Rute publik

Semua rute publik selalu berawalan locale. `/` mengarahkan ke `/id`.

| Rute                                   | Prioritas | Fase | Rendering                     | Catatan                      |
| -------------------------------------- | --------- | ---- | ----------------------------- | ---------------------------- |
| `/` → `/id`                            | M         | 1    | redirect                      | middleware next-intl         |
| `/[locale]`                            | M         | 3    | statis + revalidate           | homepage, 11 bagian          |
| `/[locale]/about`                      | M         | 3    | statis                        |                              |
| `/[locale]/experience`                 | M         | 3    | statis                        |                              |
| `/[locale]/projects`                   | M         | 3    | statis                        |                              |
| `/[locale]/projects/[slug]`            | M         | 3    | statis + generateStaticParams |                              |
| `/[locale]/expertise`                  | S         | 3    | statis                        |                              |
| `/[locale]/certifications`             | S         | 3    | statis                        |                              |
| `/[locale]/recruiter`                  | M         | 3    | statis                        | wajib bisa dicetak           |
| `/[locale]/contact`                    | M         | 3    | statis + server action        |                              |
| `/[locale]/privacy`                    | M         | 3    | statis                        | wajib karena ada form kontak |
| `/[locale]/terms`                      | S         | 3    | statis                        |                              |
| `/[locale]/knowledge`                  | S         | 4    | statis                        | landing KB                   |
| `/[locale]/knowledge/sop`              | S         | 4    | statis                        | listing + filter             |
| `/[locale]/knowledge/sop/[slug]`       | S         | 4    | statis                        |                              |
| `/[locale]/knowledge/labs`             | S         | 4    | statis                        |                              |
| `/[locale]/knowledge/labs/[slug]`      | S         | 4    | statis                        |                              |
| `/[locale]/knowledge/incidents`        | S         | 4    | statis                        |                              |
| `/[locale]/knowledge/incidents/[slug]` | S         | 4    | statis                        |                              |
| `/[locale]/knowledge/articles`         | L         | 4    | statis                        | kosong saat rilis            |
| `/[locale]/knowledge/articles/[slug]`  | L         | 4    | statis                        |                              |
| `/[locale]/knowledge/category/[slug]`  | S         | 4    | statis                        |                              |
| `/[locale]/knowledge/tag/[slug]`       | S         | 4    | statis                        |                              |
| `/[locale]/search`                     | L         | 7    | dinamis                       | cadangan command palette     |

**Catatan Fase 3.5:** saat go-live, rute Knowledge Base belum ada. Tautan "Jelajahi Knowledge Base" di hero dan navbar disembunyikan lewat flag, bukan dibiarkan mengarah ke 404. Flag dinyalakan di akhir Fase 4.

---

## 3. Rute admin

Tidak berawalan locale. Antarmuka admin **hanya bahasa Indonesia** — hanya satu orang yang memakainya, dan menerjemahkan CMS menggandakan pekerjaan tanpa manfaat.

| Rute                         | Prioritas | Fase  | Catatan                                   |
| ---------------------------- | --------- | ----- | ----------------------------------------- |
| `/admin/login`               | M         | 1     | hanya email + password, tanpa daftar      |
| `/admin`                     | M         | 1 → 5 | Fase 1 minimal, dashboard penuh di Fase 5 |
| `/admin/profile`             | M         | 3     |                                           |
| `/admin/experiences`         | M         | 3     |                                           |
| `/admin/projects`            | M         | 3     |                                           |
| `/admin/skills`              | S         | 3     |                                           |
| `/admin/certifications`      | S         | 3     |                                           |
| `/admin/messages`            | M         | 3     | pesan dari form kontak                    |
| `/admin/knowledge`           | S         | 5     |                                           |
| `/admin/knowledge/new`       | S         | 5     |                                           |
| `/admin/knowledge/[id]/edit` | S         | 5     | editor Tiptap                             |
| `/admin/categories`          | S         | 5     |                                           |
| `/admin/tags`                | S         | 5     |                                           |
| `/admin/media`               | S         | 5     | pustaka `MediaAsset`                      |
| `/admin/backup`              | S         | 5     | ekspor JSON/Markdown                      |
| `/admin/analytics`           | L         | 7     |                                           |
| `/admin/settings`            | L         | 5     |                                           |

**Tidak ada** rute registrasi, lupa password publik, atau undangan pengguna. Akun admin dibuat lewat skrip seed sekali jalan.

---

## 4. Rute teknis

| Rute                        | Prioritas | Fase |
| --------------------------- | --------- | ---- |
| `/robots.txt`               | M         | 3.5  |
| `/sitemap.xml`              | M         | 3.5  |
| `/api/auth/[...all]`        | M         | 1    |
| `/[locale]/opengraph-image` | L         | 7    |
| `/feed.xml`                 | L         | 7    |

`robots.txt` wajib memblokir `/admin` dan seluruh URL bertanda pratinjau.

---

## 5. Status khusus tiap halaman

Setiap segmen rute wajib punya:

| Berkas             | Fase | Keterangan                             |
| ------------------ | ---- | -------------------------------------- |
| `loading.tsx`      | 1    | skeleton, bukan spinner                |
| `error.tsx`        | 1    | client component, ada tombol coba lagi |
| `not-found.tsx`    | 1    | terlokalisasi                          |
| `global-error.tsx` | 1    | satu di root                           |

Halaman 404 harus terlokalisasi. 404 berbahasa Inggris di rute `/id` adalah cacat yang paling sering terlewat dalam proyek bilingual.

---

## 6. Aturan otorisasi rute

| Kelompok      | Aturan                                                                                 |
| ------------- | -------------------------------------------------------------------------------------- |
| Publik        | Hanya menampilkan entitas berstatus `PUBLISHED`                                        |
| Publik        | Draft dan arsip menghasilkan 404, **bukan** 403 — 403 mengonfirmasi keberadaan dokumen |
| `/admin/*`    | Middleware memeriksa sesi; menolak → redirect ke `/admin/login`                        |
| Server action | Memeriksa sesi lagi **di dalam action**, tidak bergantung pada middleware saja         |
| Berkas privat | Hanya lewat signed URL yang dibuat di server, umur ≤ 15 menit                          |

Pemeriksaan ganda pada server action disengaja: middleware Next.js tidak menjamin berjalan pada setiap jalur pemanggilan, jadi tidak boleh menjadi satu-satunya lapisan.

---

## 7. Peta ke fase

```
Fase 1  ── / , /id , /en , /admin/login , /admin (minimal) , status khusus
Fase 2  ── shell: navbar, drawer, footer (tanpa halaman isi baru)
Fase 3  ── seluruh rute portofolio M/S + admin CRUD inti
Fase 3.5 ─ DEPLOY: domain, HTTPS, robots, sitemap  ← situs live
Fase 4  ── seluruh rute /knowledge/*
Fase 5  ── seluruh rute /admin/* sisanya
Fase 6  ── blok terstruktur di dalam rute Fase 4 (tanpa rute baru)
Fase 7  ── /search , /feed.xml , opengraph-image , /admin/analytics
Fase 8  ── tanpa rute baru; hardening
Fase 9  ── tanpa rute baru; konten
```
