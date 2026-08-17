# 06 — ATURAN KEAMANAN

Situs ini punya satu pengguna terautentikasi dan banyak konten publik. Permukaan serangan kecil — jadi tidak ada alasan untuk lalai.

---

## 1. Rahasia

**Tidak pernah** masuk ke repositori:

- Password, token, API key
- Isi `.env.local`
- Connection string database
- Kredensial di berkas tes, data seed, komentar, atau screenshot

```ts
// ❌ NEXT_PUBLIC_ berarti ikut terkirim ke browser
NEXT_PUBLIC_DATABASE_URL=...
NEXT_PUBLIC_BETTER_AUTH_SECRET=...
```

**Awalan `NEXT_PUBLIC_` hanya untuk nilai yang aman dilihat siapa pun.** Saat ini hanya `NEXT_PUBLIC_SITE_URL`.

Kalau rahasia tidak sengaja ter-commit: rahasianya harus **diganti**, bukan cukup dihapus dari riwayat git.

---

## 2. Otorisasi

### Setiap server action memeriksa sesi di baris pertama

```ts
'use server'

export async function updateProject(input: unknown) {
  const user = await requireAdmin() // ← wajib, baris pertama
  const data = updateProjectSchema.parse(input)
  // …
}
```

**Middleware tidak cukup.** Middleware Next.js tidak dijamin berjalan pada setiap jalur pemanggilan, jadi tidak boleh menjadi satu-satunya lapisan. Middleware untuk pengalaman pengguna; pemeriksaan di dalam action untuk keamanan.

### Draft menghasilkan 404, bukan 403

```ts
const doc = await prisma.knowledgeDocument.findFirst({
  where: { slug, status: 'PUBLISHED' }, // ← selalu
})
if (!doc) notFound()
```

403 mengonfirmasi bahwa dokumen itu ada. 404 tidak membocorkan apa pun.

### Setiap query publik menyaring status

Lihat [07_DATA_PRISMA.md](07_DATA_PRISMA.md). Query publik tanpa `status: 'PUBLISHED'` adalah kebocoran data, bukan bug tampilan.

---

## 3. Validasi input

**Semua** data dari luar divalidasi dengan Zod sebelum menyentuh database:

```ts
const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  message: z.string().trim().min(20).max(4000),
  company: z.string().trim().max(120).optional(),
})
```

Berlaku untuk: input form, parameter rute, query string, dan payload unggahan.

Validasi di klien untuk kenyamanan. Validasi di server untuk keamanan. **Selalu keduanya, tidak pernah hanya klien.**

Selalu beri batas `max()`. String tanpa batas panjang adalah jalan mudah menuju kehabisan memori.

---

## 4. HTML dan XSS

```tsx
// ❌ dilarang di rute publik
<div dangerouslySetInnerHTML={{ __html: doc.contentIdHtml }} />
```

Halaman publik dirender dari `contentIdJson` (dokumen Tiptap) lewat renderer React di server. Kolom HTML hanya untuk indeks pencarian dan tidak pernah dirender.

Kalau suatu saat HTML benar-benar harus dirender, harus melewati sanitizer allowlist di server terlebih dahulu — dan itu keputusan yang perlu dibicarakan, bukan diputuskan sendiri.

---

## 5. Unggahan berkas

Setiap unggahan wajib melewati:

| Pemeriksaan | Aturan                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------- |
| Tipe MIME   | Allowlist: `image/png`, `image/jpeg`, `image/webp`, `application/pdf`, `application/zip` |
| Ukuran      | Gambar ≤ 5 MB, arsip ≤ 10 MB                                                             |
| Ekstensi    | Harus cocok dengan MIME                                                                  |
| Nama berkas | **Dibuat ulang di server.** Jangan pernah memakai nama dari klien                        |
| Isi         | Verifikasi magic bytes, jangan percaya header MIME                                       |

Nama dari klien bisa berisi `../` atau karakter yang berbahaya bagi kunci penyimpanan. Selalu buat nama baru.

Berkas privat hanya diakses lewat signed URL yang dibuat di server, umur maksimal **15 menit**. Bucket privat tidak pernah punya akses publik.

Aset baru default `isPublic = false`. Perpindahan ke publik hanya setelah [checklist redaksi](../phase-0/02_REDACTION_CHECKLIST.md) dijalankan.

---

## 6. Form kontak

Empat lapisan perlindungan:

1. **Honeypot** — field tersembunyi yang harus tetap kosong.
2. **Cloudflare Turnstile** — diverifikasi di server, bukan hanya dirender di klien.
3. **Rate limit** — maksimal 3 kiriman per IP per jam.
4. **Validasi Zod** di server.

**Jangan menyimpan IP pengunjung mentah.** Untuk rate limiting, simpan hash IP + garam, dengan masa simpan pendek. PRD bab 17 melarang penyimpanan IP mentah.

---

## 7. Autentikasi

- Login admin saja. **Tidak ada rute registrasi, undangan, atau lupa password publik.**
- Akun dibuat lewat skrip seed sekali jalan.
- Kalau menemukan endpoint sign-up masih bisa diakses, itu **cacat keamanan tingkat tinggi** — laporkan segera, jangan diperbaiki diam-diam.
- Sesi memakai cookie `httpOnly`, `secure`, `sameSite=lax`.
- Jangan pernah menaruh data sesi di `localStorage`.

---

## 8. Yang tidak boleh dicatat di log

```ts
// ❌
console.log('Login attempt', { email, password })
console.log('User session', session)

// ✅
console.log('Login attempt failed', { emailHash: hash(email) })
```

Tidak boleh masuk log: password, token, isi sesi, isi pesan kontak, path berkas privat.

`AuditLog` mencatat **aksi**, bukan isi: `{ action: 'DOCUMENT_PUBLISHED', entityId: 'abc' }`.

---

## 9. Dependency

- Jangan menambah dependency di luar rencana fase tanpa bertanya.
- Periksa unduhan mingguan dan tanggal rilis terakhir sebelum mengusulkan paket.
- Waspadai paket yang namanya mirip paket populer.
- Jalankan `npm audit` sebelum menutup fase.

---

## 10. Checklist sebelum PR

- [ ] Tidak ada rahasia di kode, tes, atau data seed
- [ ] Setiap server action memanggil `requireAdmin()` di baris pertama
- [ ] Setiap query publik menyaring `status: 'PUBLISHED'`
- [ ] Semua input divalidasi Zod **di server**
- [ ] Draft menghasilkan 404, bukan 403
- [ ] Tidak ada `dangerouslySetInnerHTML` di rute publik
- [ ] Unggahan memeriksa MIME, ukuran, dan membuat nama baru
- [ ] Tidak ada `console.log` berisi data sensitif
- [ ] Tidak ada rahasia di variabel `NEXT_PUBLIC_`
