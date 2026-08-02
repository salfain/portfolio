import 'server-only'

import { localStorageDriver } from './local'
import type { StorageDriver } from './types'

export type { StorageDriver } from './types'
export { buildStorageKey, isValidStorageKey } from './key'

/**
 * Driver yang sedang dipakai.
 *
 * Satu-satunya tempat pilihan penyimpanan ditentukan. Saat R2 dipasang,
 * yang berubah hanya berkas ini — pemanggilnya tidak tahu bedanya.
 */
export const storage: StorageDriver = localStorageDriver
