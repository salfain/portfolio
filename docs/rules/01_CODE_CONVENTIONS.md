# 01 — KONVENSI KODE

---

## 1. Struktur folder

```
src/
├── app/              # HANYA routing. Sedikit logika.
├── components/
│   ├── ui/           # primitif tanpa domain: Button, Card, Badge, Dialog
│   ├── layout/       # Navbar, Footer, MobileDrawer
│   ├── sections/     # bagian halaman: HeroSection, FeaturedWorkSection
│   └── knowledge/    # komponen khusus domain KB
├── data/             # query database. server-only. tanpa JSX.
├── lib/              # util, klien, konstanta. tanpa JSX.
├── hooks/            # React hook. selalu client.
├── types/            # tipe bersama
├── i18n/             # konfigurasi next-intl
└── styles/
```

**Aturan penempatan:**

| Pertanyaan | Jawaban |
|---|---|
| Menyentuh database? | `src/data/` |
| Fungsi murni tanpa React? | `src/lib/` |
| Dipakai ≥ 2 tempat dan tanpa domain? | `src/components/ui/` |
| Khusus satu halaman? | `src/components/sections/` |

Berkas di `src/app/` idealnya hanya merakit komponen dan mengambil data. Kalau `page.tsx` melebihi ±80 baris, ada yang harus dipindahkan.

---

## 2. Penamaan

| Hal | Aturan | Contoh |
|---|---|---|
| Nama berkas | kebab-case | `theme-toggle.tsx` |
| Komponen | PascalCase | `ThemeToggle` |
| Hook | `use-` + kebab-case | `use-scroll-progress.ts` |
| Fungsi & variabel | camelCase | `getPublishedProjects` |
| Konstanta | SCREAMING_SNAKE | `MAX_UPLOAD_BYTES` |
| Tipe & interface | PascalCase | `KnowledgeCardProps` |
| Boolean | awali `is` / `has` / `should` | `isPublished`, `hasTranslation` |
| Berkas tes | `*.test.ts` | `format-date.test.ts` |

Satu komponen utama per berkas, dan nama berkasnya mengikuti nama komponen.

Nama fungsi query dimulai dari kata kerja yang jelas: `getPublishedProjects`, `findDocumentBySlug`, `countPublishedByType`. Hindari `getData`, `fetchStuff`, `handleThing`.

---

## 3. Server Component vs Client Component

**Default adalah Server Component.** Tidak perlu menulis apa pun.

Tambahkan `'use client'` **hanya** bila komponen butuh salah satu dari:

- `useState`, `useEffect`, `useRef`, atau hook React lain
- Event handler (`onClick`, `onChange`, `onSubmit`)
- API browser (`window`, `document`, `localStorage`)
- Animasi Motion yang butuh state atau hook
- Library pihak ketiga yang khusus klien (Tiptap)

### Dorong `'use client'` ke daun

❌ **Salah** — seluruh halaman menjadi client hanya karena satu tombol:

```tsx
'use client'
export default function ProjectsPage() {
  const [filter, setFilter] = useState('all')
  return (
    <div>
      <h1>Proyek</h1>
      <FilterBar value={filter} onChange={setFilter} />
      <ProjectList filter={filter} />
    </div>
  )
}
```

✅ **Benar** — hanya bagian interaktif yang menjadi client:

```tsx
// page.tsx — Server Component
export default async function ProjectsPage() {
  const projects = await getPublishedProjects()
  return (
    <div>
      <h1>{t('projects.title')}</h1>
      <ProjectExplorer projects={projects} />  {/* satu-satunya client */}
    </div>
  )
}
```

### Larangan

- `page.tsx` dan `layout.tsx` **tidak boleh** menjadi Client Component. Kecuali `error.tsx` dan `global-error.tsx`, yang memang harus client.
- Jangan `import` modul dari `src/data/` di dalam Client Component. Modul itu memakai `import 'server-only'` dan akan menggagalkan build — itu memang disengaja.
- Data diambil di Server Component lalu dikirim sebagai props. Jangan `fetch` dari `useEffect` untuk data awal.

---

## 4. Aturan TypeScript

Mode `strict` menyala. Berikut yang sering menjadi masalah.

### Dilarang `any`

```ts
// ❌
function parse(data: any) { … }

// ✅
function parse(data: unknown) {
  const parsed = schema.parse(data)   // Zod menyempitkan tipenya
}
```

### Dilarang `!` (non-null assertion)

```ts
// ❌
const doc = docs.find(d => d.slug === slug)!

// ✅
const doc = docs.find(d => d.slug === slug)
if (!doc) notFound()
```

Satu-satunya pengecualian: setelah pemeriksaan eksplisit yang tidak bisa dipahami compiler — dan wajib disertai komentar alasannya.

### Fungsi yang diekspor punya tipe kembalian eksplisit

```ts
// ✅
export async function getPublishedProjects(): Promise<ProjectCard[]> { … }
```

Fungsi lokal boleh mengandalkan inferensi.

### Zod adalah satu sumber kebenaran

Jangan menulis tipe dua kali.

```ts
// ❌
type ContactInput = { name: string; email: string }
const contactSchema = z.object({ name: z.string(), email: z.string().email() })

// ✅
const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
})
type ContactInput = z.infer<typeof contactSchema>
```

### `type` vs `interface`

Pakai `type` untuk semua bentuk objek. Pakai `interface` hanya kalau benar-benar butuh `extends` atau declaration merging.

---

## 5. Props komponen

```tsx
type ProjectCardProps = {
  project: ProjectCard
  priority?: boolean
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) { … }
```

Aturan:

- Tipe props diberi nama `<NamaKomponen>Props` dan diletakkan tepat di atas komponen.
- Nilai default ditulis di destructuring, bukan `defaultProps`.
- Jangan meneruskan `...props` sembarangan ke elemen DOM kecuali komponen tersebut memang pembungkus tipis.
- Lebih dari 6 props biasanya berarti komponennya perlu dipecah.

---

## 6. Import

Urutan (ESLint akan menegakkannya):

```ts
import { Suspense } from 'react'              // 1. eksternal
import Image from 'next/image'

import { getPublishedProjects } from '@/data/projects'   // 2. internal @/
import { ProjectCard } from '@/components/ui/project-card'

import type { ProjectCard as ProjectCardType } from '@/types'  // 3. tipe
```

Selalu pakai alias `@/`. Jangan pernah `../../../lib/utils`.

---

## 7. Penanganan error

### Di Server Component

```tsx
const doc = await findPublishedDocument(slug, type)
if (!doc) notFound()      // menghasilkan 404, bukan 403 — lihat 06_SECURITY.md
```

### Di server action

Kembalikan hasil bertipe, jangan lempar exception ke UI:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
```

Pesan error yang dilihat pengguna berasal dari kunci terjemahan, bukan dari pesan exception. Pesan exception bisa membocorkan struktur internal.

---

## 8. Komentar

Tulis komentar untuk menjelaskan **kenapa**, bukan **apa**.

```ts
// ❌ menaikkan i sebanyak satu
i++

// ✅ Neon memutus koneksi idle setelah 5 menit, jadi query panjang
// dipecah menjadi beberapa batch agar tidak kena timeout.
```

Bahasa komentar: Indonesia. Nama variabel dan fungsi: Inggris.

---

## 9. Yang dilarang

| ❌ | ✅ |
|---|---|
| `console.log` tertinggal di kode | Hapus sebelum commit |
| `// @ts-ignore` | Perbaiki tipenya, atau tanya |
| `// eslint-disable-next-line` tanpa alasan | Sertakan komentar alasannya |
| `dangerouslySetInnerHTML` di rute publik | Render dari JSON Tiptap |
| `useEffect` untuk mengambil data awal | Ambil di Server Component |
| Nilai warna hex langsung di kode | Pakai token, lihat [02_STYLING.md](02_STYLING.md) |
| Teks langsung di JSX rute publik | Pakai kunci terjemahan, lihat [03_I18N.md](03_I18N.md) |
| `export default` untuk komponen non-halaman | Pakai named export |
