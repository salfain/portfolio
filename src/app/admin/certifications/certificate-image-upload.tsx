'use client'

import { useRef, useState } from 'react'

type CertificateImageUploadProps = {
  certificateId: string | null
  imageUrl: string | null | undefined
}

export function CertificateImageUpload({
  certificateId,
  imageUrl: initialImageUrl,
}: CertificateImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? null)
  const [message, setMessage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function uploadImage(file: File) {
    if (!certificateId) return

    setIsUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await fetch(
        `/api/admin/certifications/${certificateId}/image`,
        {
          method: 'POST',
          body: formData,
        },
      )
      const result = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !result.url) {
        setMessage(result.error ?? 'Gambar gagal diunggah.')
        return
      }

      setImageUrl(result.url)
      setMessage('Gambar sertifikat tersimpan.')
    } catch {
      setMessage('Gambar gagal diunggah. Coba lagi.')
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function removeImage() {
    if (!certificateId || !imageUrl) return

    setIsUploading(true)
    setMessage(null)

    try {
      const response = await fetch(
        `/api/admin/certifications/${certificateId}/image`,
        {
          method: 'DELETE',
        },
      )
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setMessage(result.error ?? 'Gambar gagal dihapus.')
        return
      }

      setImageUrl(null)
      setMessage('Gambar sertifikat dihapus.')
    } catch {
      setMessage('Gambar gagal dihapus. Coba lagi.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <fieldset className="space-y-4 rounded-3xl border border-border p-6">
      <legend className="px-2 text-sm font-medium">Gambar sertifikat</legend>
      <p className="text-xs text-muted">
        JPG, PNG, atau WebP, maksimal 5 MB. Simpan sertifikat terlebih dahulu
        sebelum mengunggah gambar.
      </p>

      {imageUrl ? (
        <div className="space-y-3">
          <img
            src={imageUrl}
            alt="Pratinjau gambar sertifikat"
            className="max-h-72 w-full rounded-xl border border-border object-contain"
          />
          <button
            type="button"
            onClick={removeImage}
            disabled={isUploading}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hapus gambar
          </button>
        </div>
      ) : null}

      <input
        ref={inputRef}
        id="certificateImage"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={!certificateId || isUploading}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void uploadImage(file)
        }}
        className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-elevated file:px-3 file:py-2 file:font-medium"
      />

      {!certificateId ? (
        <p className="text-xs text-muted">
          Setelah sertifikat disimpan, buka menu Ubah untuk mengunggah gambar.
        </p>
      ) : null}
      {isUploading ? <p className="text-sm text-muted">Mengunggah...</p> : null}
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </fieldset>
  )
}
