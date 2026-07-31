# 07 — KEPUTUSAN SKEMA DATABASE

**Fase:** 0
**Status:** menggantikan `docs/04_DATABASE_DRAFT.prisma` bila keduanya bertentangan.
**Dasar:** persetujuan pemilik atas poin 4–8 (lihat `README.md` fase-0).

---

## 1. Ringkasan perubahan dari draf asli

| # | Perubahan | Alasan |
|---|---|---|
| 1 | `ProjectMedia` + `KnowledgeEvidence` → satu model `MediaAsset` | Draf asli tidak punya pustaka media terpusat padahal PRD bab 12 memintanya |
| 2 | Tambah `ProjectKnowledgeLink` | PRD bab 10 meminta "SOP/lab terkait" tapi draf tidak punya relasinya |
| 3 | Tambah `categoryId` + tag pada `Project` | Panel "Explore My Work" memfilter lintas tipe konten |
| 4 | Hapus `viewCount` dari `KnowledgeDocument` | Increment saat render memaksa halaman dinamis; bertabrakan dengan target LCP |
| 5 | `isPublished: Boolean` → `PublishStatus` di semua entitas publik | Satu penjaga query, satu komponen badge, satu aturan |
| 6 | Tambah tabel Better Auth | Draf asli tidak memilikinya sama sekali |
| 7 | `difficulty` String → enum `Difficulty` | Mencegah nilai bebas yang merusak filter |
| 8 | Tambah `metadata.isLabReproduction` pada insiden | Mencegah insiden lab tampil sebagai insiden produksi |

---

## 2. Skema revisi

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enum ────────────────────────────────────────────────

enum UserRole {
  ADMIN
}

enum PublishStatus {
  DRAFT
  IN_REVIEW
  PUBLISHED
  ARCHIVED
}

enum KnowledgeType {
  SOP
  LAB
  INCIDENT
  ARTICLE
}

enum Difficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum MediaKind {
  IMAGE
  SCREENSHOT
  DIAGRAM
  TERMINAL_OUTPUT
  DOCUMENT
  ARCHIVE
}

// ─── Better Auth ─────────────────────────────────────────
// Regenerasi dengan `npx @better-auth/cli generate` di Fase 1.
// Bentuk di bawah adalah perkiraan dan WAJIB diverifikasi
// terhadap versi Better Auth yang benar-benar terpasang.

model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  emailVerified Boolean  @default(false)
  image         String?
  role          UserRole @default(ADMIN)   // field tambahan
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  sessions           Session[]
  accounts           Account[]
  knowledgeDocuments KnowledgeDocument[]
  auditLogs          AuditLog[]

  @@map("user")
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id @default(cuid())
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  password              String?   // hash kredensial admin
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@unique([providerId, accountId])
  @@map("account")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}

// ─── Profil & portofolio ─────────────────────────────────

model SiteProfile {
  id              String   @id @default(cuid())
  name            String
  roleId          String
  roleEn          String
  headlineId      String
  headlineEn      String
  summaryId       String
  summaryEn       String
  location        String?
  email           String
  phone           String?
  whatsapp        String?
  availabilityId  String?
  availabilityEn  String?
  profileImageUrl String?
  cvIdUrl         String?
  cvEnUrl         String?
  githubUrl       String?
  linkedinUrl     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Experience {
  id             String        @id @default(cuid())
  company        String
  positionId     String
  positionEn     String
  summaryId      String
  summaryEn      String
  location       String?
  startDate      DateTime
  endDate        DateTime?
  isCurrent      Boolean       @default(false)
  achievementsId Json?
  achievementsEn Json?
  tools          String[]
  sortOrder      Int           @default(0)
  status         PublishStatus @default(DRAFT)
  publishedAt    DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([status, sortOrder])
}

model Skill {
  id          String        @id @default(cuid())
  name        String
  category    String
  level       String?
  icon        String?
  sortOrder   Int           @default(0)
  isFeatured  Boolean       @default(false)
  status      PublishStatus @default(DRAFT)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([status, category, sortOrder])
}

model Certificate {
  id            String        @id @default(cuid())
  name          String
  issuer        String
  issueDate     DateTime?
  expiryDate    DateTime?
  credentialUrl String?
  imageUrl      String?
  skills        String[]
  sortOrder     Int           @default(0)
  status        PublishStatus @default(DRAFT)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([status, sortOrder])
}

model Project {
  id            String             @id @default(cuid())
  categoryId    String?
  category      KnowledgeCategory? @relation(fields: [categoryId], references: [id])
  titleId       String
  titleEn       String?
  slug          String             @unique
  summaryId     String
  summaryEn     String?
  problemId     String?
  problemEn     String?
  solutionId    String?
  solutionEn    String?
  resultId      String?
  resultEn      String?
  roleId        String?
  roleEn        String?
  tools         String[]
  repositoryUrl String?
  demoUrl       String?
  status        PublishStatus      @default(DRAFT)
  isFeatured    Boolean            @default(false)
  sortOrder     Int                @default(0)
  publishedAt   DateTime?
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  media          MediaAsset[]
  tags           ProjectTag[]
  knowledgeLinks ProjectKnowledgeLink[]

  @@index([status, isFeatured, sortOrder])
}

// ─── Knowledge Base ──────────────────────────────────────

model KnowledgeCategory {
  id            String              @id @default(cuid())
  nameId        String
  nameEn        String
  slug          String              @unique
  descriptionId String?
  descriptionEn String?
  icon          String?
  color         String?
  sortOrder     Int                 @default(0)
  documents     KnowledgeDocument[]
  projects      Project[]
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
}

model KnowledgeDocument {
  id               String             @id @default(cuid())
  authorId         String
  author           User               @relation(fields: [authorId], references: [id])
  categoryId       String?
  category         KnowledgeCategory? @relation(fields: [categoryId], references: [id])
  type             KnowledgeType
  status           PublishStatus      @default(DRAFT)
  slug             String             @unique
  documentCode     String?            @unique
  version          String             @default("1.0")
  titleId          String
  titleEn          String?
  summaryId        String
  summaryEn        String?
  contentIdJson    Json
  contentEnJson    Json?
  contentIdHtml    String?            // hanya untuk indeks pencarian
  contentEnHtml    String?            // hanya untuk indeks pencarian
  difficulty       Difficulty?
  estimatedMinutes Int?
  tools            String[]
  metadata         Json?
  isFeatured       Boolean            @default(false)
  sortOrder        Int                @default(0)
  publishedAt      DateTime?
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  media          MediaAsset[]
  revisions      KnowledgeRevision[]
  tags           KnowledgeDocumentTag[]
  projectLinks   ProjectKnowledgeLink[]

  @@index([type, status, publishedAt])
  @@index([categoryId, status])
  @@index([status, isFeatured])
}

model KnowledgeRevision {
  id            String            @id @default(cuid())
  documentId    String
  document      KnowledgeDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)
  version       String
  changeSummary String
  contentIdJson Json
  contentEnJson Json?
  metadata      Json?
  createdById   String?
  createdAt     DateTime          @default(now())

  @@index([documentId, createdAt])
}

model KnowledgeTag {
  id        String                 @id @default(cuid())
  name      String                 @unique
  slug      String                 @unique
  documents KnowledgeDocumentTag[]
  projects  ProjectTag[]
}

model KnowledgeDocumentTag {
  documentId String
  tagId      String
  document   KnowledgeDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)
  tag        KnowledgeTag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([documentId, tagId])
  @@index([tagId])
}

model ProjectTag {
  projectId String
  tagId     String
  project   Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag       KnowledgeTag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([projectId, tagId])
  @@index([tagId])
}

model ProjectKnowledgeLink {
  projectId  String
  documentId String
  project    Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)
  document   KnowledgeDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)
  note       String?
  sortOrder  Int               @default(0)

  @@id([projectId, documentId])
  @@index([documentId])
}

// ─── Media terpadu ───────────────────────────────────────

model MediaAsset {
  id           String  @id @default(cuid())
  kind         MediaKind @default(IMAGE)

  // Pemilik opsional. Keduanya null = aset bebas di pustaka media.
  projectId    String?
  project      Project?           @relation(fields: [projectId], references: [id], onDelete: Cascade)
  documentId   String?
  document     KnowledgeDocument? @relation(fields: [documentId], references: [id], onDelete: Cascade)

  fileKey      String   @unique   // kunci objek di R2
  fileUrl      String
  thumbnailUrl String?
  mimeType     String
  fileSize     Int
  width        Int?
  height       Int?

  titleId      String?
  titleEn      String?
  altId        String              // wajib
  altEn        String?
  captionId    String?
  captionEn    String?

  tool         String?
  testDate     DateTime?
  sourceNote   String?             // ringkasan apa yang disunting saat redaksi

  isCover            Boolean @default(false)
  isPublic           Boolean @default(false)   // default privat, disengaja
  redactionConfirmed Boolean @default(false)

  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([documentId, sortOrder])
  @@index([projectId, sortOrder])
  @@index([isPublic, kind])
}

// ─── Operasional ─────────────────────────────────────────

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  company   String?
  subject   String?
  message   String
  locale    String   @default("id")
  isRead    Boolean  @default(false)
  isSpam    Boolean  @default(false)
  repliedAt DateTime?
  createdAt DateTime @default(now())

  @@index([isRead, createdAt])
}

model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AuditLog {
  id         String   @id @default(cuid())
  actorId    String?
  actor      User?    @relation(fields: [actorId], references: [id], onDelete: SetNull)
  action     String
  entityType String
  entityId   String?
  metadata   Json?
  createdAt  DateTime @default(now())

  @@index([entityType, entityId])
  @@index([createdAt])
}
```

---

## 3. Catatan atas keputusan yang tidak jelas dengan sendirinya

### `MediaAsset` memakai FK bernullable, bukan `ownerType` + `ownerId` generik

Polimorfisme generik akan menghilangkan integritas referensial — Prisma tidak bisa cascade delete pada `ownerId` bertipe string. Dua FK nullable menjaga cascade dan tetap type-safe. Kelemahannya: menambah jenis pemilik baru berarti menambah kolom. Dengan hanya dua jenis pemilik, ini pertukaran yang menguntungkan.

Konsekuensi: perlu satu constraint di tingkat aplikasi — `projectId` dan `documentId` tidak boleh terisi keduanya. Ditegakkan lewat Zod, bukan lewat database.

### Cover memakai `isCover`, bukan FK terpisah

Relasi cover terpisah akan membuat dua relasi antara `MediaAsset` dan `Project` (dan dua lagi ke `KnowledgeDocument`), yang di Prisma butuh nama relasi eksplisit dan mudah salah. `isCover` menjamin cover selalu ada di pustaka dan sudah lolos redaksi. Aturan "hanya satu cover per pemilik" ditegakkan di lapisan aplikasi.

### `isPublic` default `false`

Kebalikan dari draf asli. Aset baru bersifat privat sampai seseorang secara sadar menerbitkannya. Default yang aman lebih baik daripada default yang nyaman.

### `slug` tetap unik global, bukan unik per tipe

Rute memang dipisah per tipe (`/knowledge/sop/...` vs `/knowledge/labs/...`), jadi `@@unique([type, slug])` secara teknis cukup. Tapi slug unik global membuat pencarian, tautan terkait, dan ekspor backup bisa merujuk dokumen dengan satu kunci tanpa perlu tahu tipenya. Harganya murah — cukup beri awalan pada slug (`sop-`, `lab-`, `insiden-`).

### `contentIdHtml` hanya untuk indeks pencarian

Halaman publik dirender dari `contentIdJson` lewat renderer React di server. HTML tidak pernah masuk `dangerouslySetInnerHTML` di jalur publik. Kolom HTML disimpan agar Postgres full-text search (Fase 7) punya teks datar untuk di-index.

### `Session.ipAddress` berisi IP admin, bukan IP pengunjung

PRD bab 17 melarang menyimpan IP pengunjung mentah. Kolom ini milik Better Auth dan hanya terisi saat pemilik login. Kalau tetap tidak diinginkan, matikan lewat konfigurasi Better Auth di Fase 1.

---

## 4. Yang masih harus diverifikasi di Fase 1

| Hal | Cara verifikasi |
|---|---|
| Bentuk tabel Better Auth | `npx @better-auth/cli generate` lalu bandingkan |
| `@@map` huruf kecil pada tabel auth | Ikuti apa pun yang dihasilkan CLI |
| Dukungan konfigurasi teks `indonesian` | `\dF` di psql; kalau tidak ada → `simple` + `pg_trgm` |
| Ekstensi `pg_trgm` & `unaccent` | `CREATE EXTENSION` — pastikan penyedia mengizinkan |

Sampai keempatnya terverifikasi, skema ini adalah rancangan, bukan migrasi.
