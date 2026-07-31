import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Gabungkan kelas Tailwind dengan benar: kelas yang bertabrakan
 * (mis. px-4 vs px-6) diselesaikan oleh tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
