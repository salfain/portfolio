# 07 — DATA & PRISMA

Skema resmi: [`../phase-0/07_SCHEMA_DECISIONS.md`](../phase-0/07_SCHEMA_DECISIONS.md).

---

## 1. Semua akses database di `src/data/`

```
src/data/
├── projects.ts
├── knowledge.ts
├── profile.ts
└── _guards.ts
```

Setiap berkas diawali:

```ts
import 'server-only'
```

Ini membuat build gagal kalau modulnya tidak sengaja diimpor dari Client Component. Itu tujuannya.

**Jangan pernah** memanggil `prisma` langsung dari komponen, `page.tsx`, atau server action. Action memanggil fungsi di `src/data/`, bukan Prisma.

Alasannya: aturan "publik hanya melihat PUBLISHED" harus ditegakkan di satu tempat. Kalau query tersebar di seluruh komponen, satu yang terlewat sudah cukup untuk membocorkan draft.

---

## 2. Aturan terpenting: query publik selalu menyaring status

```ts
// ❌ KEBOCORAN DATA — draft ikut tampil
export async function getProjects() {
  return prisma.project.findMany()
}

// ✅
export async function getPublishedProjects(): Promise<ProjectCard[]> {
  return prisma.project.findMany({
    where: { status: 'PUBLISHED' },
    select: projectCardSelect,
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
  })
}
```

**Konvensi penamaan yang wajib diikuti:**

| Awalan                             | Arti                        | Boleh dipakai di |
| ---------------------------------- | --------------------------- | ---------------- |
| `getPublished*` / `findPublished*` | Sudah menyaring `PUBLISHED` | Rute publik      |
| `getAdmin*`                        | Semua status                | Hanya `/admin/*` |

Fungsi `getAdmin*` **wajib** memanggil `requireAdmin()` di dalamnya, bukan hanya mengandalkan pemanggilnya.

---

## 3. Selalu pakai `select`

```ts
// ❌ mengambil semua kolom, termasuk contentIdHtml yang besar
prisma.knowledgeDocument.findMany({ where: { status: 'PUBLISHED' } })

// ✅
const documentCardSelect = {
  id: true,
  slug: true,
  type: true,
  titleId: true,
  titleEn: true,
  summaryId: true,
  summaryEn: true,
  difficulty: true,
  estimatedMinutes: true,
  publishedAt: true,
} satisfies Prisma.KnowledgeDocumentSelect
```

Halaman listing tidak butuh isi dokumen. Mengambilnya berarti memindahkan megabyte JSON dari database untuk kemudian dibuang.

Definisikan objek `select` sekali per bentuk kartu, ekspor, dan pakai ulang.

---

## 4. Hindari N+1

```ts
// ❌ 1 + N query
const docs = await getPublishedDocuments()
for (const doc of docs) {
  doc.tags = await prisma.knowledgeTag.findMany({ where: { … } })
}

// ✅ satu query
const docs = await prisma.knowledgeDocument.findMany({
  where: { status: 'PUBLISHED' },
  select: { ...documentCardSelect, tags: { select: { tag: { select: { name: true, slug: true } } } } },
})
```

---

## 5. Cache dan revalidasi

Halaman publik statis dengan revalidasi berbasis tag:

```ts
export async function getPublishedProjects() {
  'use cache'
  cacheTag('projects')
  // …
}
```

Setelah mutasi berhasil di admin:

```ts
revalidateTag('projects')
```

**Jangan** memakai `export const dynamic = 'force-dynamic'` di halaman publik. Itu mematikan caching dan merusak target LCP. Kalau merasa membutuhkannya, ada masalah lain yang perlu dibicarakan dulu.

---

## 6. Migrasi

```bash
npx prisma migrate dev --name deskripsi-singkat
```

Aturan:

- **Jangan pernah** mengubah `schema.prisma` tanpa membuat migrasi.
- **Jangan pernah** menyunting berkas migrasi yang sudah ter-commit.
- **Jangan pernah** menjalankan `prisma db push` — itu memotong riwayat migrasi.
- Nama migrasi deskriptif: `add-media-asset`, bukan `update`.
- Perubahan skema masuk ke commit terpisah dari perubahan fitur.

Kalau migrasi menghapus kolom atau tabel, **berhenti dan tanya dulu.** Migrasi destruktif tidak dijalankan tanpa persetujuan.

Neon membutuhkan `DIRECT_URL` terpisah untuk migrasi — Prisma Migrate tidak bisa lewat koneksi pooled.

---

## 7. Transaksi

Beberapa penulisan yang harus berhasil atau gagal bersama-sama dibungkus transaksi:

```ts
await prisma.$transaction(async (tx) => {
  await tx.knowledgeRevision.create({ data: revision })
  await tx.knowledgeDocument.update({ where: { id }, data: updates })
  await tx.auditLog.create({ data: { action: 'DOCUMENT_PUBLISHED', … } })
})
```

Menerbitkan dokumen tanpa mencatat revisinya akan menghasilkan riwayat yang bohong.

---

## 8. Aturan khusus proyek ini

### Media

- Aset baru selalu `isPublic = false`.
- `projectId` dan `documentId` tidak boleh terisi keduanya — ditegakkan lewat Zod, karena database tidak bisa menegakkannya.
- Hanya satu `isCover = true` per pemilik — ditegakkan di lapisan aplikasi.

### Kelengkapan bahasa

Kelengkapan bahasa Inggris **dihitung**, tidak disimpan:

```ts
export function isLocaleComplete(
  doc: KnowledgeDocument,
  locale: 'id' | 'en',
): boolean
```

Kolom tersimpan akan basi setiap kali dokumen disunting.

### Tidak ada `viewCount`

Sengaja dihapus dari MVP. Increment saat render memaksa halaman menjadi dinamis. Analitik dikerjakan di Fase 7 sebagai tabel terpisah yang ditulis async.

### Data seed

Berasal dari `content/**/*.json`. Seed harus **idempoten** — dijalankan dua kali tidak boleh menghasilkan duplikat. Pakai `upsert` dengan kunci `slug`.

Data seed tidak boleh berisi data pribadi, kredensial, atau angka yang dikarang.

---

## 9. Checklist sebelum PR

- [ ] Query database hanya ada di `src/data/`
- [ ] Setiap berkas data memakai `import 'server-only'`
- [ ] Setiap query publik menyaring `status: 'PUBLISHED'`
- [ ] Setiap `findMany` memakai `select`
- [ ] Tidak ada query di dalam loop
- [ ] Perubahan skema disertai berkas migrasi
- [ ] Penulisan yang berkaitan dibungkus transaksi
- [ ] Seed bersifat idempoten
