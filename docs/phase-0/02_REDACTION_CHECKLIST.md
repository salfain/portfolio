# 02 — CHECKLIST REDAKSI BUKTI

**Fase:** 0
**Sifat:** wajib. Setiap aset publik harus lolos checklist ini sebelum diterbitkan.

Di Fase 5, checklist ini menjadi dialog konfirmasi di CMS yang menulis `redactionConfirmed = true` beserta catatan audit. Sampai saat itu, jalankan manual.

---

## Prinsip

1. **Ambil ulang lebih aman daripada menyensor.** Screenshot yang berisi kredensial tidak disensor — diambil ulang di lingkungan bersih.
2. **Sensor harus merusak piksel.** Kotak hitam di atas gambar boleh; blur ringan, mosaik lemah, atau highlighter tidak — semuanya bisa dibalik sebagian.
3. **Ragu berarti privat.** Aset yang meragukan tetap di bucket privat.
4. **Redaksi tidak menghapus kewajiban izin.** Data perusahaan yang disamarkan tetap data perusahaan.

---

## A. Checklist universal — semua gambar

- [ ] Tidak ada password, PIN, kode OTP, atau frasa sandi
- [ ] Tidak ada API key, token, connection string, atau isi berkas `.env`
- [ ] Tidak ada alamat IP publik (lihat bagian E untuk yang boleh)
- [ ] Tidak ada nama domain internal perusahaan
- [ ] Tidak ada nama perusahaan, logo, atau watermark tanpa izin
- [ ] Tidak ada nama, foto, email, atau nomor telepon orang lain
- [ ] Tidak ada nomor seri perangkat, service tag, atau lisensi
- [ ] Tidak ada nomor tiket yang bisa dilacak ke sistem nyata
- [ ] Tidak ada alamat MAC perangkat produksi
- [ ] Tidak ada QR code atau barcode (bisa memuat data tersembunyi)
- [ ] Tidak ada path berisi nama pengguna nyata (`C:\Users\namaasli\`)
- [ ] Metadata EXIF sudah dibersihkan (lihat bagian F)
- [ ] Nama berkas sudah diganti sesuai `01_ASSET_CLASSIFICATION.md`

---

## B. Tambahan — screenshot desktop / aplikasi

- [ ] Taskbar dan system tray tidak memperlihatkan aplikasi internal perusahaan
- [ ] Notifikasi (email, chat, kalender) tidak terlihat
- [ ] Tab browser dan bookmark bar tidak memperlihatkan URL internal
- [ ] Nama profil pengguna di pojok aplikasi sudah diganti atau disensor
- [ ] Wallpaper bukan wallpaper korporat
- [ ] Jam dan tanggal tidak mengungkap waktu kerja yang sensitif
- [ ] Tidak ada dokumen lain yang terbuka di latar belakang

**Praktik terbaik:** ambil screenshot jendela tunggal (`Alt + PrtScn`), bukan seluruh layar.

---

## C. Tambahan — output terminal / CLI

- [ ] Hostname diganti menjadi generik (`R1`, `SW-CORE`, `PC-CLIENT-01`)
- [ ] Prompt tidak memuat nama pengguna atau nama domain nyata
- [ ] Riwayat perintah tidak ikut terbawa
- [ ] Banner login / MOTD sudah dihapus
- [ ] Tidak ada community string SNMP, secret RADIUS, atau pre-shared key
- [ ] `show running-config` sudah disaring, bukan disalin utuh
- [ ] Hash password (`enable secret`, `$1$`, `$9$`) sudah dihapus, bukan sekadar dibuat kabur

**Lebih disukai:** tempel teks terminal sebagai blok kode, bukan gambar. Teks bisa dibaca screen reader, bisa dicari, bisa disalin, dan jauh lebih mudah disunting.

---

## D. Tambahan — screenshot PNETLab / lab

- [ ] Nama lab tidak memuat nama perusahaan atau klien
- [ ] Label perangkat generik, bukan nama perangkat produksi
- [ ] Alamat manajemen server PNETLab tidak terlihat
- [ ] Tidak ada informasi lisensi image perangkat
- [ ] Sesi pengguna lain tidak terlihat di antarmuka
- [ ] Skema IP memakai rentang privat yang didokumentasikan

---

## E. Aturan alamat IP

**Boleh publik** — rentang privat & dokumentasi:

| Rentang                                             | Sumber                       |
| --------------------------------------------------- | ---------------------------- |
| `10.0.0.0/8`                                        | RFC 1918                     |
| `172.16.0.0/12`                                     | RFC 1918                     |
| `192.168.0.0/16`                                    | RFC 1918                     |
| `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` | RFC 5737, khusus dokumentasi |
| `2001:db8::/32`                                     | RFC 3849, khusus dokumentasi |

**Tidak boleh publik:**

- IP publik apa pun milik perusahaan, sekolah, atau rumah
- Endpoint VPN, IP WAN, IP gateway ISP
- IP publik server yang benar-benar berjalan

Untuk contoh yang butuh "terasa seperti IP publik", pakai rentang RFC 5737. Rentang itu memang dibuat untuk dokumentasi dan tidak akan pernah menunjuk sistem nyata.

---

## F. Membersihkan metadata

Sebelum unggah, hapus EXIF (lokasi GPS, model kamera, nama perangkat lunak, timestamp):

```bash
npx exiftool-vendored --version
```

Cara paling sederhana tanpa alat tambahan: buka gambar lalu **simpan ulang lewat aplikasi penyunting gambar** — sebagian besar metadata hilang. Untuk pembersihan yang pasti, gunakan ExifTool:

```bash
exiftool -all= -overwrite_original gambar.png
```

Untuk PDF (CV, sertifikat), periksa juga properti dokumen: nama penulis dan path berkas asli sering ikut tersimpan.

---

## G. Insiden yang berasal dari kejadian nyata

Selain checklist A–F, wajib:

- [ ] Nama perusahaan diganti deskripsi generik ("kantor multi-lokasi ±50 pengguna" — **hanya jika angkanya benar**)
- [ ] Nama dan jabatan orang dihapus seluruhnya
- [ ] Tanggal dikaburkan ke tingkat bulan atau dihapus
- [ ] Tidak ada detail yang membuat organisasinya bisa dikenali
- [ ] Dampak bisnis dijelaskan secara kualitatif, bukan angka finansial
- [ ] Sudah dikonfirmasi tidak melanggar perjanjian kerja atau NDA

**Jika izin tidak jelas, jangan terbitkan.** Reproduksi ulang kasusnya di lab dan tandai sebagai skenario lab — nilainya untuk pewawancara teknis hampir sama, tanpa risiko.

---

## H. Penandaan skenario lab

Setiap dokumen insiden yang **direproduksi di lab** wajib memuat penanda yang terlihat di bagian atas halaman, dalam dua bahasa:

> **ID:** Skenario ini direproduksi di lab untuk keperluan dokumentasi.
> **EN:** This scenario was reproduced in a lab for documentation purposes.

Ini bukan sekadar kehati-hatian — pewawancara teknis yang mengetahui insiden lab disajikan sebagai insiden produksi akan menganggapnya masalah integritas, bukan masalah teknis.

---

## I. Pencatatan

Setiap aset publik dicatat di `MediaAsset` dengan:

| Field                | Isi                                           |
| -------------------- | --------------------------------------------- |
| `redactionConfirmed` | `true` hanya setelah checklist ini dijalankan |
| `isPublic`           | `true`                                        |
| `sourceNote`         | Ringkasan singkat apa yang disunting          |

Dan satu baris `AuditLog` dengan aksi `MEDIA_REDACTION_CONFIRMED`. Tanpa keduanya, aset tidak boleh berpindah ke bucket publik.
