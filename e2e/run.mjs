/**
 * Tes E2E jalur kritis.
 *
 * Menguji yang TIDAK bisa dibuktikan tes unit: bahwa server yang benar-benar
 * berjalan menolak permintaan yang harus ditolak, dan bahwa antarmuka yang
 * benar-benar dirender bekerja dengan keyboard.
 *
 * Jalankan:
 *
 *   npm run build && npm run start &            # atau server yang sudah ada
 *   E2E_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
 *
 * Peramban dijalankan sendiri oleh skrip ini bila `E2E_CDP_URL` tidak diisi.
 *
 * Seluruh umpan uji dihapus di akhir, termasuk saat tes gagal — `finally`
 * bukan hiasan di sini. Umpan yang tertinggal di database akan muncul di
 * halaman publik pada build berikutnya.
 */
import { spawn } from 'node:child_process'

import { connect, newPage, waitForBrowser } from './lib/cdp.mjs'
import { cleanup, disconnect, seed } from './lib/fixtures.mjs'

const BASE = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000'
const CDP = process.env.E2E_CDP_URL ?? 'http://127.0.0.1:9333'
const CHROME =
  process.env.E2E_CHROME_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD

const results = []

function check(name, passed, detail = '') {
  results.push({ name, passed })
  console.log(`${passed ? '  ✅' : '  ❌'} ${name}${detail ? ` → ${detail}` : ''}`)
}

async function status(path, cookie) {
  const response = await fetch(`${BASE}${path}`, {
    redirect: 'manual',
    headers: cookie ? { Cookie: cookie } : {},
  })

  return response.status
}

/**
 * Login sebagai admin.
 *
 * `Origin` WAJIB dikirim dan harus cocok dengan `BETTER_AUTH_URL` server
 * yang diuji — Better Auth menolak permintaan dari origin yang tidak
 * tepercaya sebagai perlindungan CSRF. Kalau langkah ini gagal 403,
 * yang salah hampir selalu konfigurasi, bukan kata sandinya.
 */
async function signIn(origin = BASE) {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return null

  const response = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })

  /**
   * `getSetCookie()`, bukan `get('set-cookie')`.
   *
   * Set-Cookie diperlakukan khusus oleh implementasi fetch Node: `get()`
   * mengembalikan `null` untuknya, dan itu membuat seluruh langkah bersesi
   * terlewat DIAM-DIAM — tesnya tetap hijau sambil tidak menguji apa pun.
   */
  const cookies = response.headers.getSetCookie?.() ?? []
  const first = cookies[0] ?? response.headers.get('set-cookie')

  return first ? first.split(';')[0] : null
}

async function main() {
  console.log(`\nE2E terhadap ${BASE}\n`)

  const fixtures = await seed()
  const cookie = await signIn()

  // ── Kontrol akses ────────────────────────────────────────
  console.log('Kontrol akses')

  check(
    'dokumen terbit bisa dibuka',
    (await status(`/id/knowledge/sop/${fixtures.terbit.slug}`)) === 200,
  )

  /**
   * Ini kriteria terima Fase 8. Bukan 403: keberadaan draft untuk suatu
   * slug adalah informasi tersendiri.
   */
  check(
    'dokumen DRAFT membalas 404 tanpa sesi',
    (await status(`/id/knowledge/sop/${fixtures.draft.slug}`)) === 404,
  )

  const draftHtml = await fetch(
    `${BASE}/id/knowledge/sop/${fixtures.draft.slug}`,
  ).then((response) => response.text())

  check(
    'judul draft tidak muncul di HTML mana pun',
    !draftHtml.includes('RAHASIA UJI E2E'),
  )

  check(
    'aset bukti privat membalas 404 tanpa sesi',
    (await status(fixtures.asetPrivat.fileUrl)) === 404,
  )

  check('admin dialihkan ke login tanpa sesi', (await status('/admin')) === 307)

  check(
    'sesi admin berhasil dibuat untuk langkah berikutnya',
    cookie !== null,
    cookie
      ? ''
      : 'ADMIN_SEED_* kosong, atau BETTER_AUTH_URL server tidak sama dengan E2E_BASE_URL',
  )

  /**
   * Perlindungan CSRF Better Auth: login dari origin lain harus ditolak.
   *
   * Ini yang membuat cookie sesi admin tidak bisa diterbitkan oleh halaman
   * jahat di domain lain. Bergantung penuh pada `BETTER_AUTH_URL` yang
   * benar — kalau salah, yang gagal justru login yang sah, dan itu arah
   * kegagalan yang aman.
   */
  check(
    'login dari origin lain ditolak (CSRF)',
    (await signIn('https://penyerang.test')) === null,
  )

  if (cookie) {
    check('admin bisa dibuka dengan sesi', (await status('/admin', cookie)) === 200)

    /**
     * Pasangan yang menentukan: URL yang SAMA membalas 404 tanpa sesi dan
     * 200 dengan sesi. Memeriksa salah satunya saja tidak membuktikan
     * apa-apa — 404 bisa berarti berkasnya memang tidak ada.
     */
    check(
      'aset privat: 200 dengan sesi admin, 404 tanpa',
      (await status(fixtures.asetPrivat.fileUrl, cookie)) === 200 &&
        (await status(fixtures.asetPrivat.fileUrl)) === 404,
    )

    check(
      'daftar dokumen admin memuat draft',
      (await fetch(`${BASE}/admin/knowledge`, {
        headers: { Cookie: cookie },
      }).then((response) => response.text())).includes('RAHASIA UJI E2E'),
    )
  }

  // ── Header keamanan ──────────────────────────────────────
  console.log('\nHeader keamanan')

  const headers = (await fetch(`${BASE}/id`)).headers

  for (const name of [
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy',
    'permissions-policy',
  ]) {
    check(`${name} terpasang`, headers.get(name) !== null)
  }

  check(
    'CSP tidak mengizinkan skrip dari host luar',
    !/script-src[^;]*https?:\/\//.test(headers.get('content-security-policy') ?? ''),
  )

  // ── Pencarian ────────────────────────────────────────────
  console.log('\nPencarian')

  const hasil = await fetch(`${BASE}/api/search?q=jaringan`).then((response) =>
    response.json(),
  )

  check('pencarian menemukan dokumen terbit', hasil.hits.length > 0)
  check(
    'pencarian TIDAK mengembalikan draft',
    !hasil.hits.some((hit) => hit.slug === fixtures.draft.slug),
  )

  for (const aneh of ['((', '" tak tertutup', "' OR 1=1 --"]) {
    check(
      `masukan aneh tidak menjatuhkan server: ${aneh}`,
      (await status(`/api/search?q=${encodeURIComponent(aneh)}`)) === 200,
    )
  }

  // ── Antarmuka ────────────────────────────────────────────
  console.log('\nAntarmuka')

  let chromium = null

  if (!process.env.E2E_CDP_URL) {
    chromium = spawn(CHROME, [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      `--remote-debugging-port=${new URL(CDP).port}`,
      '--user-data-dir=/tmp/e2e-chrome',
      'about:blank',
    ])
  }

  const browser = await connect(await waitForBrowser(CDP))
  const page = await newPage(browser)

  try {
    await page.goto(`${BASE}/id`, 3000)

    check(
      'beranda memuat tanpa galat konsol',
      page.errors.length === 0,
      page.errors[0] ?? '',
    )

    await page.press('k', { modifiers: 2 })
    await new Promise((resolve) => setTimeout(resolve, 800))

    check(
      'Ctrl+K membuka command palette',
      await page.evaluate('!!document.querySelector(\'input[role="combobox"]\')'),
    )

    await page.type('jaringan')
    await new Promise((resolve) => setTimeout(resolve, 1500))

    check(
      'palette menampilkan hasil',
      (await page.evaluate(
        'document.querySelectorAll(\'[role="option"]\').length',
      )) > 0,
    )

    check(
      'palette tidak menampilkan draft',
      !(await page.evaluate('document.body.innerText')).includes(
        'RAHASIA UJI E2E',
      ),
    )

    await page.press('Enter')
    await new Promise((resolve) => setTimeout(resolve, 2500))

    check(
      'Enter membuka halaman hasil',
      (await page.evaluate('location.pathname')).includes('/knowledge/'),
    )
  } finally {
    browser.close()
    chromium?.kill()
  }
}

try {
  await main()
} finally {
  const dihapus = await cleanup()

  console.log(`\nPembersihan: ${dihapus} dokumen uji dihapus.`)
  await disconnect()
}

const gagal = results.filter((result) => !result.passed)

console.log(
  `\n${results.length - gagal.length}/${results.length} lolos` +
    (gagal.length ? ` — GAGAL: ${gagal.map((r) => r.name).join(', ')}` : ''),
)

process.exit(gagal.length === 0 ? 0 : 1)
