# 05 — AKSESIBILITAS

Target: **WCAG 2.1 AA**. Ini persyaratan, bukan bonus.

---

## 1. HTML semantik dulu, ARIA belakangan

```tsx
// ❌ butuh 4 baris ARIA + handler keyboard untuk menyamai tombol asli
<div onClick={handleClick}>Kirim</div>

// ✅ sudah bisa difokus, bisa ditekan Enter/Space, dikenali screen reader
<button onClick={handleClick}>Kirim</button>
```

**Aturan ARIA pertama: jangan pakai ARIA kalau ada elemen HTML yang tepat.**

| Butuh | Pakai |
|---|---|
| Berpindah halaman | `<a>` / `<Link>` |
| Melakukan aksi | `<button>` |
| Daftar item | `<ul>` / `<ol>` |
| Data tabular | `<table>` dengan `<th scope>` |
| Kelompok form | `<fieldset>` + `<legend>` |
| Konten yang bisa dilipat | `<details>` / `<summary>` |

---

## 2. Struktur heading

- **Tepat satu `<h1>` per halaman.**
- Tingkat tidak boleh melompat: setelah `h2` tidak boleh langsung `h4`.
- Heading dipilih berdasarkan struktur, bukan ukuran. Butuh teks besar yang bukan heading? Pakai `<p className="text-3xl">`.

Sticky TOC di halaman Knowledge Base dibangun dari heading dokumen — struktur yang salah membuat TOC salah.

---

## 3. Keyboard

**Setiap** hal yang bisa dilakukan dengan mouse harus bisa dilakukan dengan keyboard.

| Tombol | Perilaku yang diharapkan |
|---|---|
| `Tab` | Maju ke elemen fokus berikutnya, urutannya mengikuti urutan visual |
| `Shift + Tab` | Mundur |
| `Enter` | Mengaktifkan tautan dan tombol |
| `Space` | Mengaktifkan tombol, checkbox |
| `Escape` | Menutup dialog, drawer, command palette |
| `↑ ↓` | Berpindah di dalam daftar hasil pencarian |

**Uji cara ini:** buka halaman, taruh tangan menjauh dari mouse, dan telusuri seluruh halaman hanya dengan keyboard. Kalau tersangkut atau kehilangan jejak fokus, itu cacat.

### Fokus wajib terlihat

```css
/* ❌ dilarang keras */
*:focus { outline: none; }

/* ✅ */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Perangkap fokus di dialog

Dialog dan drawer harus: memindahkan fokus ke dalam saat dibuka, menahan fokus di dalam, dan **mengembalikan fokus ke elemen pemicu** saat ditutup. Primitif Radix sudah menangani ini — itu sebabnya kita memakainya alih-alih membuat dialog sendiri.

### Skip link

Tautan "Lompat ke konten utama" wajib ada sebagai elemen fokus pertama di setiap halaman. Tersembunyi sampai difokus.

---

## 4. Gambar dan media

| Jenis gambar | `alt` |
|---|---|
| Bermakna (topologi, screenshot) | Deskripsikan isinya secara spesifik |
| Dekoratif | `alt=""` — kosong, bukan dihilangkan |
| Di dalam tautan tanpa teks | Deskripsikan tujuan tautannya |

```tsx
// ❌
<Image alt="gambar" />
<Image alt="screenshot" />

// ✅
<Image alt="Topologi lab: dua switch akses terhubung ke satu router melalui trunk 802.1Q" />
```

Alt text wajib ada dalam dua bahasa (`altId`, `altEn`). Aset tanpa `altId` tidak bisa diterbitkan — ditegakkan di CMS Fase 5.

---

## 5. Warna dan kontras

| Elemen | Rasio minimum |
|---|---|
| Teks normal | 4.5 : 1 |
| Teks besar (≥ 24 px) | 3 : 1 |
| Batas komponen UI, ikon | 3 : 1 |

Periksa di **kedua tema**. Pasangan token sudah dirancang lolos, tapi kombinasi baru harus diverifikasi.

### Warna tidak boleh menjadi satu-satunya penanda

```tsx
// ❌ tidak terbaca oleh pengguna buta warna
<span className="text-danger">Draft</span>

// ✅ ada ikon dan teks
<span className="text-danger"><CircleDot aria-hidden /> Draft</span>
```

Berlaku untuk badge status, prioritas insiden (P1/P2/P3), dan tingkat kesulitan.

---

## 6. Form

```tsx
<label htmlFor="email">{t('form.email')}</label>
<input
  id="email"
  type="email"
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : undefined}
/>
{error && <p id="email-error" role="alert">{error}</p>}
```

Aturan:

- Setiap input punya `<label>` yang benar-benar terhubung. Placeholder **bukan** label.
- Pesan error terhubung lewat `aria-describedby` dan memakai `role="alert"`.
- Error muncul sebagai teks, tidak hanya sebagai border merah.
- Tandai field wajib di label, tidak hanya dengan tanda bintang berwarna.

---

## 7. Tabel

Rencana IP/VLAN dan test case sering lebar. Di mobile:

```tsx
<div className="overflow-x-auto" tabIndex={0} role="region" aria-label={t('table.ipPlan')}>
  <table>
    <caption className="sr-only">{t('table.ipPlanCaption')}</caption>
    <thead><tr><th scope="col">…</th></tr></thead>
  </table>
</div>
```

`tabIndex={0}` pada kontainer yang bisa di-scroll membuatnya bisa digulir dengan keyboard. Tanpa itu, pengguna keyboard tidak bisa melihat kolom yang terpotong.

---

## 8. Konten dinamis

Hasil pencarian dan filter yang berubah harus diumumkan:

```tsx
<div aria-live="polite" className="sr-only">
  {t('search.resultCount', { count: results.length })}
</div>
```

Pakai `aria-live="polite"`. `assertive` hanya untuk hal yang benar-benar mendesak — hampir tidak pernah dibutuhkan di situs ini.

---

## 9. Checklist sebelum PR

- [ ] Satu `<h1>`, tingkat heading tidak melompat
- [ ] Seluruh halaman bisa ditelusuri dengan keyboard
- [ ] Fokus terlihat di setiap elemen interaktif
- [ ] Dialog mengembalikan fokus ke pemicunya saat ditutup
- [ ] Semua gambar punya `alt` yang bermakna atau `alt=""`
- [ ] Kontras lolos di tema terang **dan** gelap
- [ ] Warna bukan satu-satunya penanda makna
- [ ] Input punya label yang terhubung
- [ ] Target sentuh ≥ 44 px
- [ ] Tabel lebar bisa di-scroll dengan keyboard
- [ ] Reduced motion dihormati

**Alat bantu:** ekstensi axe DevTools untuk pemeriksaan cepat. Tapi axe hanya menangkap sekitar sepertiga masalah — pengujian keyboard manual tetap wajib.
