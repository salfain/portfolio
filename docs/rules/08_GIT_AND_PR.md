# 08 — GIT & PULL REQUEST

---

## 1. Branch

```
phase-<n>/<deskripsi-singkat>
```

Contoh:

```
phase-1/i18n-routing
phase-1/better-auth
phase-3/hero-section
fix/theme-flash-on-reload
```

Satu branch mengerjakan satu hal. Branch yang menyentuh 40 berkas di 6 area berbeda tidak bisa diperiksa dengan benar.

---

## 2. Format commit

Conventional Commits:

```
<tipe>: <deskripsi>
```

| Tipe | Untuk |
|---|---|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `refactor` | Perubahan struktur tanpa perubahan perilaku |
| `style` | Format, spasi, tanpa perubahan logika |
| `test` | Menambah atau memperbaiki tes |
| `docs` | Dokumentasi |
| `chore` | Perkakas, dependency, konfigurasi |
| `perf` | Perbaikan performa |

Aturan:

- Deskripsi bahasa Inggris, huruf kecil, kalimat perintah: `add`, bukan `added` atau `adds`.
- Maksimal 72 karakter di baris pertama.
- Tanpa titik di akhir.

```
✅ feat: add locale switcher with route preservation
✅ fix: prevent theme flash on hard reload
✅ chore: add prisma and configure client singleton

❌ Update stuff
❌ fixed bug
❌ feat: added the new locale switcher component that preserves the current route when switching
```

Butuh menjelaskan **kenapa**? Tulis di badan commit:

```
fix: prevent theme flash on hard reload

next-themes menerapkan kelas setelah hidrasi, sehingga tema gelap
sempat berkedip putih. Skrip inline di <head> membaca localStorage
sebelum paint pertama.
```

---

## 3. Ukuran commit

Satu commit = satu perubahan utuh yang bisa dijelaskan dalam satu kalimat.

**Terlalu besar:** `feat: phase 1` menyentuh 30 berkas.
**Terlalu kecil:** `fix: typo` sebanyak 8 commit berturut-turut.
**Pas:** `feat: add i18n routing config` — 4 berkas yang saling berkaitan.

Setiap commit harus bisa di-build. Jangan commit kode yang tidak bisa dikompilasi dengan alasan "nanti diperbaiki di commit berikutnya".

Contoh pemecahan Fase 1:

```
chore: scaffold next.js app with typescript strict
feat: add design tokens and tailwind config
feat: add next-intl routing for id and en
feat: add theme provider without flash
feat: add prisma schema and client singleton
feat: add better auth admin-only login
feat: add zod environment validation
feat: add error, loading, and not-found boundaries
test: add vitest setup and ci workflow
```

---

## 4. Yang tidak boleh di-commit

| ❌ | |
|---|---|
| `.env.local` atau berkas env apa pun berisi nilai asli | |
| `node_modules/`, `.next/` | |
| Berkas berisi kredensial, token, IP publik | |
| Screenshot yang belum lolos checklist redaksi | |
| `console.log` yang tertinggal | |
| Kode yang dikomentari "untuk berjaga-jaga" | Hapus saja, git yang menyimpannya |
| Berkas besar (> 5 MB) | Media masuk ke R2, bukan git |

---

## 5. Sebelum membuka PR

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm run test
```

```bash
npm run build
```

Keempatnya harus lolos **di mesin sendiri** sebelum PR dibuka. CI adalah jaring pengaman, bukan alat coba-coba.

---

## 6. Deskripsi PR

Pakai template di `.github/PULL_REQUEST_TEMPLATE.md`. Isi semuanya — checklist yang dicentang tanpa dikerjakan lebih buruk daripada checklist kosong, karena menghilangkan kepercayaan pada seluruh proses.

Sertakan **screenshot terang dan gelap** untuk setiap perubahan yang terlihat. Ini yang paling membantu pemeriksa.

---

## 7. Menanggapi review

- Perbaiki lewat commit baru, jangan `--amend` setelah PR dibuka — pemeriksa jadi kehilangan jejak perubahan.
- Tidak setuju dengan masukan? Katakan, sertakan alasan. Diskusi teknis itu wajar.
- Jangan menandai komentar selesai sebelum benar-benar diperbaiki.

---

## 8. Yang tidak boleh dilakukan

| ❌ | Kenapa |
|---|---|
| `git push --force` ke branch bersama | Menghapus pekerjaan orang lain |
| Commit langsung ke `main` | Semua lewat PR |
| Menggabungkan PR yang CI-nya merah | CI merah berarti ada yang rusak |
| `git commit --no-verify` | Melewati hook yang ada untuk alasan tertentu |
| Menggabungkan pekerjaan dua fase dalam satu PR | Tidak bisa diperiksa per fase |
