# FASE 2 — CATATAN DI LUAR CAKUPAN

## N1 — `<html lang>` tidak dinamis per-locale (SELESAI)

**Masalah awal (Fase 1):** Root layout statis tanpa `lang` per-locale. Nested layout tidak boleh render `<html>`.

**Upaya Fase 2:**

1. Baca `x-next-intl-locale` header di root layout → gagal saat static prerender (header kosong)
2. Fallback `x-invoke-path` parse → gagal (header tidak tersedia saat SSG)
3. `force-dynamic` → broke RSC (`net::ERR_ABORTED`), direvert

**Solusi akhir:** Pindah `<html lang={locale}>` ke `[locale]/layout.tsx` (punya `locale` param langsung dari segment). Root layout jadi pass-through (`return children`). Admin layout render `<html lang="id" data-theme="light">` sendiri.

**Hasil:** `/id` → `lang="id"` ✓, `/en` → `lang="en"` ✓

---

## Hydration warning dari next-themes

`next-themes` set `data-theme` di `<html>` pada client, server render kosong. `suppressHydrationWarning` di `<html>` menangani mismatch. Warning di console tidak fatal — umum di semua proyek next-themes.

---

## `next lint` deprecation

`next lint` deprecated, akan dihapus di Next.js 16. Migrasi ke ESLint CLI:

```
npx @next/codemod@canary next-lint-to-eslint-cli .
```

Ditangguhkan — tidak menghambat Fase 2.

**SELESAI saat upgrade ke Next 16.** `next lint` benar-benar dihapus, jadi
gerbang lint memanggil `eslint .` dan konfigurasinya pindah ke
`eslint.config.mjs` (flat config). Codemod di atas tidak dipakai; migrasi
ditulis tangan dengan `FlatCompat` supaya seluruh aturan proyek — termasuk
larangan impor dua arah antara rute publik dan admin — tersalin persis.

---

## N4 — Skeuomorphism ditambahkan lalu dicabut (1 Agustus 2026)

Lapisan kedalaman (gradien + bayangan berlapis) sempat dipasang atas
permintaan pemilik, lalu **dicabut seluruhnya** beberapa jam kemudian
ketika sistem Glassline diadopsi — lihat N5.

Alasannya bukan selera: `design.md` Glassline menyatakan
_"Don't introduce gradients. This system is flat on purpose."_ Kedua
pendekatan itu saling meniadakan, jadi tidak ada gunanya menyimpan
keduanya berdampingan.

Tidak ada sisa: token `--sk-*`, blok `@layer components`, dan seluruh
kelas di komponen sudah dihapus.

---

## N5 — Sistem visual diganti ke Glassline (1 Agustus 2026)

Sumber: `design.md` di akar repositori, dihasilkan
`npx designdotmd add glassline`. Paketnya diverifikasi lebih dulu di
registry npm sebelum dijalankan.

> Fog-grey neutrals with a cobalt pinprick.

### Yang diambil apa adanya dari spec

| Aspek        | Nilai                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| Warna terang | primary `#0F1419` · secondary `#4A5568` · tertiary `#2C5EF5` · neutral `#F1F3F5` · surface `#FFFFFF` |
| Tipografi    | Geist (display/h1/body) + Geist Mono (label)                                                         |
| Skala teks   | display 3.75rem · h1 2.25rem · body 0.95rem/1.55 · label 0.75rem                                     |
| Radius       | sm 6px · md 10px · lg 16px                                                                           |
| Jarak        | sm 8px · md 16px · lg 32px                                                                           |

### Tema gelap DITURUNKAN, bukan dari spec

Glassline hanya memuat nilai terang. Seluruh nilai gelap diturunkan
sendiri dengan menjaga karakternya — neutral dingin berlapis, satu aksen
kobalt — lalu **setiap pasangan diverifikasi terhadap WCAG AA**:

| Token           | Nilai                                               | Rasio                                          |
| --------------- | --------------------------------------------------- | ---------------------------------------------- |
| `background`    | `#0F1419` (primary Glassline dipakai sebagai latar) | —                                              |
| `foreground`    | `#F1F3F5`                                           | 16.64:1                                        |
| `muted`         | `#8E9BA8`                                           | 6.53:1 di latar · 5.53:1 di elevated           |
| `primary`       | `#5B87FF`                                           | 5.60:1 — `#2C5EF5` asli hanya 3.55:1, gagal AA |
| `border-strong` | `#5E6A76`                                           | 3.35:1                                         |

### Dua token garis, bukan satu

Beda `surface` dan `background` di tema gelap hanya **1.07:1**, jadi garis
tepi menjadi satu-satunya penanda batas input. WCAG 1.4.11 menuntut 3:1
untuk batas komponen, dan garis setipis pemisah dekoratif tidak akan
pernah memenuhinya.

Karena itu ada `--border` (pemisah) dan `--border-strong` (batas kontrol).
Input, textarea, dan select memakai yang kedua.

### Radius diarahkan lewat skala, bukan disunting per berkas

`tailwind.config.ts` mengarahkan seluruh skala Tailwind ke tiga nilai
Glassline (`xl`→10px, `2xl`/`3xl`→16px). Hasilnya sama dengan menyunting
~100 pemakaian `rounded-*` satu per satu, tanpa risiko ada satu berkas
yang terlewat dan tetap memakai sudut lama.

`rounded-full` disapu menjadi `rounded-sm`/`rounded-md` KECUALI pada
bentuk yang memang lingkaran: titik indikator, spinner, batang skeleton,
dan toggle bahasa.

### Penyimpangan yang disengaja dari spec

| Aturan spec                          | Yang dilakukan                                   | Alasan                                                                                                                                          |
| ------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| "single-accent rule is load-bearing" | Warna `success`/`warning`/`danger` dipertahankan | Ini warna **semantik**, bukan aksen dekoratif. Pesan galat tanpa merah kehilangan makna. Nadanya diturunkan agar sejalan dengan palet dingin.   |
| "Don't introduce gradients"          | Dipatuhi penuh                                   | Shimmer skeleton yang tadinya memakai gradien diganti denyut antara dua warna solid. Terverifikasi: **0 `linear-gradient`** di CSS hasil build. |

`--cyan` dihapus — hanya didefinisikan, tidak pernah dipakai, dan
merupakan aksen alternatif yang dilarang spec.

### Verifikasi

| Yang diuji                       | Hasil                                 |
| -------------------------------- | ------------------------------------- |
| Kontras tema terang (7 pasangan) | ✅ semua ≥ 4.5:1                      |
| Kontras tema gelap (diturunkan)  | ✅ semua ≥ 4.5:1, border-strong ≥ 3:1 |
| `linear-gradient` di CSS build   | ✅ 0                                  |
| Geist + Geist Mono termuat       | ✅ 11 berkas woff2                    |
| Cincin fokus utuh                | ✅ 47 elemen di beranda               |
| Halaman publik & admin merender  | ✅ 200                                |
