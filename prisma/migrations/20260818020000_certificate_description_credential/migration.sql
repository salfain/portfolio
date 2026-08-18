-- Deskripsi dua bahasa dan nomor kredensial untuk Certificate.
--
-- Ketiganya nullable: kredensial yang sudah tersimpan tidak punya nilai
-- untuk kolom ini, dan memaksanya NOT NULL akan menggagalkan migrasi di
-- basis data yang sudah berisi data.
ALTER TABLE "Certificate" ADD COLUMN     "credentialId" TEXT,
ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "descriptionId" TEXT;
