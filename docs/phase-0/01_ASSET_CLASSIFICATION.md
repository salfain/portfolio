# 01 — KLASIFIKASI ASET & ATURAN PENAMAAN

**Fase:** 0
**Berlaku untuk:** seluruh gambar, diagram, dokumen, dan berkas lab di situs ini.

---

## 1. Tiga tingkat klasifikasi

| Tingkat | Arti | Penyimpanan |
|---|---|---|
| **PUBLIK** | Boleh diakses siapa pun tanpa login | Bucket publik R2, URL langsung, boleh di-cache CDN |
| **PRIVAT** | Hanya admin yang login | Bucket privat, hanya lewat signed URL berumur pendek |
| **TERLARANG** | Tidak boleh diunggah ke mana pun | — |

Aturan default: **setiap aset dianggap PRIVAT sampai lolos checklist redaksi** di `02_REDACTION_CHECKLIST.md`.

---

## 2. Klasifikasi per jenis aset

| Jenis aset | Klasifikasi | Syarat |
|---|---|---|
| Foto profil sendiri | PUBLIK | Foto asli milik sendiri, bukan stok |
| Screenshot proyek sendiri | PUBLIK | Data contoh, bukan data nyata pengguna |
| Screenshot topologi PNETLab | PUBLIK | IP privat saja, tanpa nama perusahaan |
| Output terminal lab | PUBLIK | Sudah disunting, hostname generik |
| Diagram draw.io / Excalidraw | PUBLIK | Buatan sendiri |
| Gambar sertifikat | PUBLIK | Sensor nomor kredensial jika bersifat rahasia |
| Berkas lab `.unl` / konfigurasi | PUBLIK **setelah disanitasi** | Password dan IP publik dihapus |
| Screenshot lingkungan kerja nyata | **PRIVAT** | Hanya versi tersunting yang boleh publik |
| Tiket / percakapan pengguna nyata | **PRIVAT** | Hanya boleh dipakai sebagai narasi anonim |
| Screenshot berisi kredensial | **TERLARANG** | Ambil ulang, jangan sensor lalu unggah |
| Konfigurasi produksi perusahaan | **TERLARANG** | Termasuk yang "sudah tidak dipakai" |
| Data pribadi orang lain | **TERLARANG** | Nama, foto, email, NIK, nomor telepon |
| Aset dari situs referensi (Anara Travel) | **TERLARANG** | Logo, foto, ikon, teks, grafis |
| Foto stok berlisensi tidak jelas | **TERLARANG** | Pakai aset berlisensi terbuka atau buatan sendiri |

---

## 3. Struktur folder object storage

```
r2://portfolio-public/
├── profile/
├── projects/<project-slug>/
├── knowledge/<doc-slug>/
├── certificates/
├── diagrams/
├── downloads/          # berkas lab yang sudah disanitasi
└── og/                 # gambar Open Graph (Fase 7)

r2://portfolio-private/
├── originals/<doc-slug>/    # sumber asli sebelum redaksi
├── cv/                      # CV, jika tidak ingin diindeks mesin pencari
└── archive/
```

Bucket privat **tidak pernah** punya akses publik. Aksesnya hanya lewat signed URL yang dibuat di server, umur maksimal 15 menit.

---

## 4. Aturan penamaan berkas

Format:

```
<slug-konteks>--<deskripsi-singkat>--<urutan>.<ext>
```

Contoh:

```
lab-vlan-departemen--topologi--01.png
lab-vlan-departemen--verifikasi-ping--03.png
sop-setup-laptop-baru--langkah-bitlocker--02.png
proyek-e-gudang--dashboard--01.png
profil--foto-utama.jpg
```

Ketentuan:

- Huruf kecil semua, pemisah kata `-`, pemisah segmen `--`.
- Tanpa spasi, tanpa karakter non-ASCII, tanpa tanggal di nama berkas.
- Tanpa nama perusahaan, nama orang, hostname nyata, atau nomor tiket.
- Urutan dua digit (`01`, `02`) supaya urut secara alfabet.

Berkas dengan nama seperti `Screenshot 2026-03-11 143207.png` **tidak boleh diunggah** — ganti nama dulu. Nama asli sering membocorkan tanggal dan konteks kerja.

---

## 5. Format & ukuran

| Kebutuhan | Format | Batas |
|---|---|---|
| Screenshot UI / terminal | PNG atau WebP | maks 1600 px sisi terpanjang, 500 KB |
| Foto profil | JPEG atau WebP | maks 1200 px, 300 KB |
| Diagram | SVG diutamakan, PNG cadangan | — |
| Cover / OG | WebP | 1200×630 |
| Berkas unduhan lab | ZIP | maks 10 MB |

Thumbnail dibuat otomatis saat unggah (Fase 5). Gambar publik dilayani lewat `next/image` dengan `width`/`height` eksplisit agar CLS tetap 0.

---

## 6. Aset yang harus dibuat sendiri

Situs ini **tidak memakai** foto stok orang, ilustrasi berbayar, atau grafis dari situs referensi. Dekorasi visual dibuat dengan:

- Gradien dan grid CSS.
- Ikon Lucide (lisensi ISC).
- Diagram buatan sendiri.
- Screenshot asli hasil kerja dan lab sendiri.

Font: Geist / Plus Jakarta Sans / JetBrains Mono — semuanya lisensi terbuka, di-host sendiri lewat `next/font`.

---

## 7. Alur kerja unggah

```
Ambil bukti asli
   └─> Simpan ke bucket PRIVAT (originals/)
        └─> Sunting: sensor, ganti hostname, potong area sensitif
             └─> Jalankan 02_REDACTION_CHECKLIST.md
                  └─> Lolos?  ── tidak ──> tetap PRIVAT
                       │
                      ya
                       └─> Ganti nama sesuai bagian 4
                            └─> Unggah ke bucket PUBLIK
                                 └─> Isi alt text ID + EN (wajib)
```

Alt text wajib dalam dua bahasa. Aset tanpa alt text tidak bisa diterbitkan — ini akan ditegakkan di form CMS (Fase 5), bukan sekadar imbauan.
