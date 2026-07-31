import { describe, expect, it } from 'vitest'

import idMessages from '../../messages/id.json'
import enMessages from '../../messages/en.json'

// Kunci pesan harus SAMA di id.json & en.json (08_I18N_FALLBACK_POLICY §8).
// Asimetri = build gagal. Tes ini menjaganya lebih awal.
function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return collectKeys(value as Record<string, unknown>, path)
    }
    return [path]
  })
}

describe('parity kunci terjemahan id/en', () => {
  const idKeys = collectKeys(idMessages).sort()
  const enKeys = collectKeys(enMessages).sort()

  it('jumlah kunci sama', () => {
    expect(idKeys.length).toBe(enKeys.length)
  })

  it('tidak ada kunci hanya di id.json', () => {
    const onlyId = idKeys.filter((k) => !enKeys.includes(k))
    expect(onlyId).toEqual([])
  })

  it('tidak ada kunci hanya di en.json', () => {
    const onlyEn = enKeys.filter((k) => !idKeys.includes(k))
    expect(onlyEn).toEqual([])
  })
})
