/**
 * Flag fitur per fase.
 *
 * Knowledge Base baru dibangun di Fase 4. Sampai fase itu selesai,
 * seluruh tautan ke `/knowledge` disembunyikan — bukan dibiarkan
 * mengarah ke 404.
 *
 * Lihat docs/phase-0/05_ROUTE_AND_PRIORITY_MAP.md §2 (catatan Fase 3.5).
 */
export const features = {
  /** Nyalakan di akhir Fase 4. */
  knowledgeBase: false,
} as const
