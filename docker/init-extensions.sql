-- Ekstensi PostgreSQL untuk Fase 7 (pencarian fuzzy & aksen).
-- Idempotent: jalan sekali saat container pertama di-init.
-- pg_trgm  → pencarian fuzzy / similarity (Knowledge Base search)
-- unaccent → normalisasi aksen (kolom tsvector)

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
