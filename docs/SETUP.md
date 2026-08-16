# MENJALANKAN DI LAPTOP

Dari klona kosong sampai situs terbuka di peramban. Perintahnya bisa
disalin apa adanya.

---

## Yang perlu ada dulu

| | Versi | Cek |
|---|---|---|
| Node.js | 20 atau lebih baru | `node -v` |
| npm | ikut Node | `npm -v` |
| Docker Desktop | untuk PostgreSQL | `docker -v` |
| Git | | `git -v` |

Docker dipakai hanya untuk databasenya. Kalau kamu sudah punya PostgreSQL
sendiri, lewati langkah 3 dan arahkan `DATABASE_URL` ke sana.

---

## 1. Ambil kodenya

```bash
git clone https://github.com/salfain/portfolio.git
cd portfolio
npm install
```

---

## 2. Siapkan dua berkas environment

Proyek ini memakai **dua** berkas, dan keduanya berbeda isi. Ini yang
paling sering keliru.

### `.env` — dibaca Docker

```bash
cp .env.example .env
```

Isi tiga baris paling bawah saja:

```bash
POSTGRES_USER=portfolio
POSTGRES_PASSWORD=pilih-kata-sandi-lokal-bebas
POSTGRES_DB=portfolio
```

### `.env.local` — dibaca aplikasi

Buat berkas baru bernama `.env.local`:

```bash
DATABASE_URL=postgresql://portfolio:pilih-kata-sandi-lokal-bebas@127.0.0.1:5432/portfolio?schema=public
BETTER_AUTH_SECRET=tempel-hasil-perintah-di-bawah
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://salfain.web.id
ADMIN_SEED_EMAIL=email-kamu@contoh.com
ADMIN_SEED_PASSWORD=kata-sandi-admin-lokal
```

Secret-nya dibuat dengan:

```bash
openssl rand -base64 32
```

Tiga hal yang penting di sini:

- **`DATABASE_URL` harus memuat kata sandi yang sama** dengan `POSTGRES_PASSWORD`
  di `.env`. Kalau berbeda, aplikasi tidak bisa masuk ke databasenya.
- **`?schema=public` wajib ada** — itu dituntut Prisma. (Tapi jangan
  ditempelkan ke `pg_dump`; lihat [phase-8/BACKUP_AND_ROLLBACK.md](phase-8/BACKUP_AND_ROLLBACK.md).)
- **`BETTER_AUTH_URL` harus sama persis dengan alamat yang kamu buka di
  peramban.** Kalau kamu membuka `http://localhost:3000`, nilainya harus
  itu. Login akan ditolak 403 bila berbeda — itu perlindungan CSRF, bukan
  bug.

Kedua berkas diabaikan Git dan tidak akan pernah ikut ter-commit.

---

## 3. Nyalakan database

```bash
docker compose up -d
```

Periksa ia benar-benar hidup:

```bash
docker compose ps          # STATUS harus "healthy"
```

Menghentikannya nanti: `docker compose down` (data tetap aman di volume).

---

## 4. Siapkan isi database

```bash
npx dotenv -e .env.local -- npx prisma migrate deploy   # buat tabelnya
npm run db:generate                                     # buat Prisma Client
npm run db:seed                                         # buat akun admin
```

`migrate deploy` dipakai, bukan `migrate dev`: yang pertama berjalan tanpa
bertanya apa pun, yang kedua kadang berhenti menunggu jawaban.

Akun admin dibuat dari `ADMIN_SEED_EMAIL` dan `ADMIN_SEED_PASSWORD` di
`.env.local`. **Tidak ada halaman pendaftaran** — ini satu-satunya cara
akun dibuat.

---

## 5. Jalankan

```bash
npm run dev
```

Buka:

| Alamat | Isi |
|---|---|
| http://localhost:3000/id | Situs, bahasa Indonesia |
| http://localhost:3000/en | Situs, bahasa Inggris |
| http://localhost:3000/admin | Panel admin (akan minta login) |

> Situsnya akan terlihat **kosong**, dan itu memang benar. Belum ada isi
> sama sekali di database. Masuk ke `/admin` untuk mulai mengisi profil,
> pengalaman, proyek, dan dokumen.

---

## Perintah yang sering dipakai

```bash
npm run dev            # server pengembangan
npm run build          # build produksi
npm run start          # jalankan hasil build

npm run lint           # gaya kode
npm run typecheck      # tipe TypeScript
npm run test           # tes unit
npm run db:studio      # lihat isi database lewat peramban
```

Sebelum commit, jalankan keempat gerbangnya:

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

### Tes E2E

Butuh server yang sudah berjalan, dan `BETTER_AUTH_URL` server itu harus
sama dengan alamat yang diuji:

```bash
npm run build
BETTER_AUTH_URL=http://127.0.0.1:3000 npm run start &
E2E_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

Tes ini membuat umpan uji di database lalu menghapusnya lagi, termasuk saat
gagal.

---

## Kalau macet

| Gejala | Sebab yang paling sering |
|---|---|
| `Can't reach database server` | Docker belum jalan — `docker compose up -d` |
| `password authentication failed` | Kata sandi di `.env` dan `.env.local` berbeda |
| `Variabel environment tidak valid` | Ada baris yang belum diisi di `.env.local`; pesannya menyebut yang mana |
| Login membalas 403 | `BETTER_AUTH_URL` tidak sama dengan alamat yang dibuka |
| `Table does not exist` | Migrasi belum dijalankan — langkah 4 |
| Port 3000 dipakai | `PORT=3001 npm run dev` |

Mengulang database dari nol (**semua isi hilang**):

```bash
docker compose down -v
docker compose up -d
npx dotenv -e .env.local -- npx prisma migrate deploy
npm run db:seed
```
