-- Full-text search PostgreSQL (Fase 7).
--
-- Kolom GENERATED, bukan kolom biasa yang diisi aplikasi: nilainya selalu
-- ikut berubah saat baris disunting, termasuk lewat SQL langsung. Kolom
-- yang diisi aplikasi akan basi tanpa ada yang menyadarinya, dan indeks
-- pencarian yang basi lebih buruk daripada tidak ada — ia menjawab dengan
-- yakin memakai isi lama.
--
-- Bobot:
--   A  judul dan kode dokumen   — paling menentukan
--   B  ringkasan
--   C  isi dokumen (teks polos, kolom contentIdHtml/contentEnHtml)
--
-- Konfigurasi teks:
--   indonesian  untuk field ID — bentuk berimbuhan jadi saling cocok
--               ("pengaturan", "mengatur", "diatur" semuanya jadi "atur")
--   english     untuk field EN
--   simple      untuk kode dokumen — "SOP-JAR-001" tidak boleh di-stem
--
-- Konfigurasi `indonesian` terverifikasi tersedia di PostgreSQL 16, yang
-- menjawab N4 Fase 1 yang tertunda. Satu kasus yang meleset tercatat di
-- docs/phase-7/NOTES.md N1.

-- Kolom biasa yang dihasilkan Prisma dibuang dulu: kolom generated tidak
-- bisa dibentuk lewat ALTER COLUMN, ekspresinya harus ikut saat ditambahkan.
ALTER TABLE "KnowledgeDocument" DROP COLUMN IF EXISTS "searchVector";
ALTER TABLE "Project" DROP COLUMN IF EXISTS "searchVector";

ALTER TABLE "KnowledgeDocument"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('indonesian', coalesce("titleId", '')), 'A') ||
    setweight(to_tsvector('english',    coalesce("titleEn", '')), 'A') ||
    setweight(to_tsvector('simple',     coalesce("documentCode", '')), 'A') ||
    setweight(to_tsvector('indonesian', coalesce("summaryId", '')), 'B') ||
    setweight(to_tsvector('english',    coalesce("summaryEn", '')), 'B') ||
    setweight(to_tsvector('indonesian', coalesce("contentIdHtml", '')), 'C') ||
    setweight(to_tsvector('english',    coalesce("contentEnHtml", '')), 'C')
  ) STORED;

ALTER TABLE "Project"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('indonesian', coalesce("titleId", '')), 'A') ||
    setweight(to_tsvector('english',    coalesce("titleEn", '')), 'A') ||
    setweight(to_tsvector('indonesian', coalesce("summaryId", '')), 'B') ||
    setweight(to_tsvector('english',    coalesce("summaryEn", '')), 'B') ||
    setweight(to_tsvector('indonesian', coalesce("problemId", '')), 'C') ||
    setweight(to_tsvector('indonesian', coalesce("solutionId", '')), 'C') ||
    setweight(to_tsvector('indonesian', coalesce("resultId", '')), 'C')
  ) STORED;

-- GIN: indeks pilihan untuk tsvector. Lebih lambat ditulis daripada GiST,
-- tapi jauh lebih cepat dibaca — dan dokumen di sini jauh lebih sering
-- dibaca daripada disunting.
CREATE INDEX "KnowledgeDocument_searchVector_idx"
  ON "KnowledgeDocument" USING GIN ("searchVector");

CREATE INDEX "Project_searchVector_idx"
  ON "Project" USING GIN ("searchVector");
