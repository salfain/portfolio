# BACKUP & ROLLBACK

**Berlaku sejak Fase 8.** Perintah di bawah bisa disalin apa adanya.

> ⚠️ Situs ini **belum pernah live**. Runbook ini ditulis dan diuji terhadap
> database pengembangan. Bagian yang menyebut host produksi baru bisa
> dijalankan setelah Fase 3.5 tuntas — lihat "Yang belum bisa diuji" di
> bagian akhir.

---

## 1. Apa yang perlu di-backup

| Yang disimpan | Di mana                   | Hilang berarti                                                                 |
| ------------- | ------------------------- | ------------------------------------------------------------------------------ |
| Isi situs     | PostgreSQL                | Seluruh dokumen, proyek, revisi, dan pesan hilang                              |
| Bukti         | `var/uploads/` (nanti R2) | Gambar dan berkas dukungan hilang; dokumennya tetap ada tapi rujukannya kosong |
| Rahasia       | `.env.local` di host      | Tidak bisa masuk, tidak bisa buka database                                     |

Kode **tidak** perlu di-backup — ia ada di Git. Yang tidak ada di Git hanya
tiga baris di atas.

---

## 2. Backup database

```bash
# `?schema=public` adalah parameter milik Prisma, BUKAN PostgreSQL.
# pg_dump menolaknya dengan "invalid URI query parameter: schema".
# Terverifikasi saat runbook ini diuji — jangan hapus baris ini.
PGURL="${DATABASE_URL%%\?*}"

# Cadangan lengkap, terkompresi, bernama menurut waktu UTC.
pg_dump "$PGURL" --format=custom --no-owner --no-privileges \
  --file="backup-$(date -u +%Y%m%d-%H%M).dump"
```

`--format=custom` dipakai, bukan SQL polos: ia terkompresi, bisa dipulihkan
sebagian, dan `pg_restore` bisa memilih tabel tertentu. SQL polos hanya bisa
dijalankan seluruhnya atau tidak sama sekali.

`--no-owner --no-privileges` supaya cadangan bisa dipulihkan ke database
dengan nama pengguna berbeda — yang hampir selalu terjadi saat memulihkan ke
tempat baru.

**Verifikasi cadangan, jangan diasumsikan:**

```bash
pg_restore --list backup-*.dump | head -20   # harus menampilkan daftar objek
```

Cadangan yang tidak pernah dicoba dipulihkan bukan cadangan — ia berkas.

---

## 3. Backup bukti

Selama penyimpanan masih lokal:

```bash
tar -czf "uploads-$(date -u +%Y%m%d-%H%M).tar.gz" var/uploads/
```

Setelah pindah ke R2, berkas tidak perlu di-backup manual: R2 punya
versioning sendiri. Yang perlu dipastikan versioning-nya **dinyalakan** —
itu tidak aktif secara default.

---

## 4. Pulihkan database

```bash
# Ke database KOSONG. Jangan pernah memulihkan ke database berisi tanpa
# --clean, dan jangan pakai --clean tanpa tahu persis apa yang dihapusnya.
createdb portfolio_restore
pg_restore --dbname=portfolio_restore --no-owner --no-privileges backup-….dump

# Periksa dulu di database pulihan sebelum menukar yang dipakai aplikasi.
psql portfolio_restore -c 'SELECT count(*) FROM "KnowledgeDocument";'
```

Baru setelah isinya benar, arahkan `DATABASE_URL` aplikasi ke sana.

---

## 5. Rollback kode

Setiap rilis adalah satu commit di branch utama. Rollback berarti kembali ke
commit sebelumnya:

```bash
git log --oneline -10                 # cari commit terakhir yang baik
git revert <sha-yang-rusak>           # BUKAN reset — riwayat tetap utuh
git push
```

`git revert`, bukan `git reset --hard`: riwayat yang sudah dipublikasikan
tidak ditulis ulang. Reset pada branch bersama akan merusak salinan siapa
pun yang sudah menariknya.

---

## 6. Rollback migrasi database — bagian yang paling berbahaya

**Migrasi tidak punya tombol undo.** Prisma tidak menghasilkan skrip turun.

Karena itu urutannya mutlak:

1. **Backup dulu**, selalu, sebelum `prisma migrate deploy`.
2. Kalau migrasi merusak, **pulihkan dari cadangan** — jangan mencoba
   membalik migrasinya dengan tangan.
3. Migrasi yang MENGHAPUS kolom atau tabel butuh persetujuan tertulis
   pemilik (CLAUDE.md, "selalu tanya").

Migrasi yang hanya menambah kolom atau indeks pada umumnya aman dan bisa
ditinggalkan apa adanya saat kode di-rollback — kode lama mengabaikan kolom
yang tidak dikenalnya.

Yang TIDAK aman ditinggalkan: kolom baru `NOT NULL` tanpa default, dan
penggantian nama. Keduanya membuat kode lama gagal menulis.

---

## 7. Jadwal yang disarankan

| Kapan                                                    | Apa                                |
| -------------------------------------------------------- | ---------------------------------- |
| Sebelum setiap `prisma migrate deploy`                   | Backup database                    |
| Harian, otomatis                                         | Backup database                    |
| Sebelum menghapus dokumen atau bukti dalam jumlah banyak | Backup keduanya                    |
| Bulanan                                                  | Uji pulihkan ke database sementara |

Yang terakhir yang paling sering dilewati, dan yang paling menentukan.

---

## 8. Yang belum bisa diuji

- Pemulihan di host produksi — belum ada hostnya (Fase 3.5)
- Versioning R2 — R2 belum dipasang (Fase 5 NOTES N4)
- Backup otomatis terjadwal — bergantung penyedia hosting yang dipilih

Ketiganya masuk daftar yang harus tuntas sebelum situs live.
