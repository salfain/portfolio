import 'server-only'

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

export const MAX_CERTIFICATE_IMAGE_BYTES = 5 * 1024 * 1024

type ObjectStorageConfig = {
  endpoint: string
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  publicBaseUrl: string
}

const imageTypes = {
  jpeg: { extension: 'jpg', mimeType: 'image/jpeg' },
  png: { extension: 'png', mimeType: 'image/png' },
  webp: { extension: 'webp', mimeType: 'image/webp' },
} as const

export type CertificateImageType = (typeof imageTypes)[keyof typeof imageTypes]

export function getObjectStorageConfig(): ObjectStorageConfig | null {
  const values = {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? 'auto',
    bucket: process.env.S3_BUCKET,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
  }

  if (Object.values(values).some((value) => !value)) return null

  return values as ObjectStorageConfig
}

export function detectCertificateImageType(
  bytes: Uint8Array,
): CertificateImageType | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return imageTypes.png
  }

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return imageTypes.jpeg
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return imageTypes.webp
  }

  return null
}

function getClient(config: ObjectStorageConfig) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: false,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
}

export async function putCertificateImage(
  config: ObjectStorageConfig,
  key: string,
  bytes: Uint8Array,
  // Dilebarkan dari mime gambar saja: fungsi ini kini juga dipakai
  // berkas profil, yang boleh berupa PDF. Jenisnya sudah ditentukan dari
  // isi berkas oleh pemanggilnya, bukan dari nilai ini.
  contentType: string,
) {
  await getClient(config).send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )
}

export async function deleteCertificateImage(
  config: ObjectStorageConfig,
  key: string,
) {
  await getClient(config).send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  )
}

export function getCertificateImageUrl(
  config: ObjectStorageConfig,
  key: string,
) {
  const base = config.publicBaseUrl.endsWith('/')
    ? config.publicBaseUrl
    : `${config.publicBaseUrl}/`

  return new URL(key, base).toString()
}

export function getCertificateImageKey(
  config: ObjectStorageConfig,
  imageUrl: string | null,
) {
  if (!imageUrl) return null

  try {
    const image = new URL(imageUrl)
    const base = new URL(
      config.publicBaseUrl.endsWith('/')
        ? config.publicBaseUrl
        : `${config.publicBaseUrl}/`,
    )

    if (
      image.origin !== base.origin ||
      !image.pathname.startsWith(base.pathname)
    ) {
      return null
    }

    return decodeURIComponent(image.pathname.slice(base.pathname.length))
  } catch {
    return null
  }
}
