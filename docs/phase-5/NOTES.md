# FASE 5 — CATATAN & TEMUAN

---

## N1 — `next-intl` open redirect 🔴 MENGHAMBAT DEPLOY

Ditemukan saat memeriksa `npm audit` di sesi ini.

`next-intl` 3.26.5 terpasang; open redirect (GHSA-8f24-v5vv-gm5j) berlaku
untuk versi **< 4.9.1**. Kerentanannya ada di lapisan routing yang ikut
terbit ke produksi.

Belum bisa dieksploitasi sekarang karena situsnya belum live, tapi
perbaikannya menuntut lompatan mayor 3 → 4 dengan perubahan API routing.
Dicatat sebagai penghambat di `docs/phase-3.5/README.md`.

Temuan kedua di paket yang sama (prototype pollution lewat
`experimental.messages.precompile`) **tidak berlaku** — fitur itu tidak dipakai.

### ⚠️ `npm audit fix --force` DILARANG

npm menyarankan "perbaikan" berupa **`next@9.3.3`** — turun enam versi mayor
dari Next.js 15.5. Menjalankannya akan menghancurkan aplikasi. Enam dari
delapan temuan lainnya adalah devDependency (`vitest`, `vite`, `esbuild`)
atau transitif build-time (`postcss`, `sharp`) yang tidak ikut ke produksi.

---

## N2 — Prisma `InputJsonValue` vs tipe dokumen

`ProseMirrorDocument` adalah objek berbentuk tetap, sedangkan Prisma menuntut
`InputJsonValue` yang menuntut index signature. Keduanya tidak cocok secara
struktural walau isinya JSON yang sah.

Konversinya dilakukan **sekali di batas database** dalam `saveDocument()`,
bukan disebar sebagai `as any` di setiap pemanggilan — `no-explicit-any`
memang dilarang di repositori ini.

---

## N3 — Aturan `no-unused-vars` belum mengenali awalan garis bawah

Konfigurasi bawaan `next/typescript` melaporkan variabel hasil destrukturisasi
yang sengaja dibuang. Ditambahkan `argsIgnorePattern`/`varsIgnorePattern`
`^_` dan `ignoreRestSiblings` di `.eslintrc.json` — konvensi umum, dan lebih
baik daripada menaburkan `eslint-disable` di banyak berkas.

---

## N4 — Yang tersisa untuk 5b

Deliverable Fase 5 di `01_PHASES.md` yang belum dikerjakan:

| Deliverable | Catatan |
|---|---|
| Autosave & pemulihan lokal | `localStorage` per dokumen, dipulihkan saat form dibuka |
| Pratinjau Indonesia/Inggris | Render `ProseMirrorContent` di dalam admin |
| Manajer bukti (media) | Butuh penyimpanan objek — lihat N5 |
| Log audit | Tabel `AuditLog` sudah ada, belum ada yang menulis (utang sejak 3b) |
| Ekspor JSON/Markdown | Format seed di `04_SEED_CONTENT_DRAFT.md` §2 sudah ditetapkan |

---

## N5 — Penyimpanan objek belum dipasang 🔴 MENGHAMBAT 5b

Manajer media butuh Cloudflare R2 atau S3-compatible lain. Q13 di
`06_OPEN_QUESTIONS.md` **belum dijawab**.

Sampai itu ada:

- `safeImageSrc()` hanya menerima path relatif (Fase 4 N3)
- `images.remotePatterns` masih kosong
- `<img>` biasa dipakai, bukan `next/image`

Unggahan ke folder lokal `public/uploads/` bisa jadi jalan sementara, tapi
**tidak akan bertahan di Vercel** — filesystem-nya ephemeral. Perlu keputusan
sebelum 5b dimulai.
