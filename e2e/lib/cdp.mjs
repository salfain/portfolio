/**
 * Pengendali Chromium minimal lewat Chrome DevTools Protocol.
 *
 * ── Kenapa bukan Playwright ──
 *
 * Playwright adalah pilihan yang wajar dan lebih lengkap. Yang membuatnya
 * tidak dipakai di sini: ia menarik ~300 MB peramban dan puluhan paket
 * untuk memeriksa delapan jalur. Node 22 sudah punya `WebSocket` bawaan,
 * dan CDP sudah cukup untuk membuka halaman, menekan tombol, dan membaca
 * DOM — yang memang hanya itu yang dibutuhkan tes ini.
 *
 * Batasnya jujur: tidak ada auto-wait, tidak ada selector engine, tidak
 * ada laporan yang rapi. Begitu tes E2E-nya tumbuh melewati belasan
 * berkas, Playwright jadi pilihan yang benar dan berkas ini dibuang.
 * Lihat docs/phase-8/NOTES.md N2.
 */

let nextId = 1

export async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl)
  const pending = new Map()
  const listeners = []

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)

    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id)

      pending.delete(message.id)
      if (message.error) {
        reject(new Error(JSON.stringify(message.error)))
      } else {
        resolve(message.result)
      }
    } else {
      listeners.forEach((fn) => fn(message))
    }
  })

  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = nextId++

      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params, sessionId }))
    })

  return { send, on: (fn) => listeners.push(fn), close: () => ws.close() }
}

export async function newPage(browser) {
  const { targetId } = await browser.send('Target.createTarget', {
    url: 'about:blank',
  })
  const { sessionId } = await browser.send('Target.attachToTarget', {
    targetId,
    flatten: true,
  })

  const call = (method, params) => browser.send(method, params, sessionId)

  await call('Page.enable')
  await call('Runtime.enable')
  await call('Network.enable')

  const errors = []

  browser.on((message) => {
    if (message.sessionId !== sessionId) return

    if (message.method === 'Runtime.exceptionThrown') {
      errors.push(
        message.params.exceptionDetails.exception?.description ??
          message.params.exceptionDetails.text,
      )
    }
  })

  return {
    call,
    errors,

    async setCookie(cookie) {
      const [name, ...rest] = cookie.split('=')

      await call('Network.setCookie', {
        name,
        value: rest.join('='),
        domain: '127.0.0.1',
        path: '/',
      })
    },

    async goto(url, settleMs = 2500) {
      await call('Page.navigate', { url })
      await new Promise((resolve) => setTimeout(resolve, settleMs))
    },

    async evaluate(expression) {
      const result = await call('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
      })

      if (result.exceptionDetails) {
        throw new Error(
          result.exceptionDetails.exception?.description ?? 'evaluate gagal',
        )
      }

      return result.result.value
    },

    async press(key, options = {}) {
      await call('Input.dispatchKeyEvent', {
        type: 'rawKeyDown',
        key,
        code: key,
        ...options,
      })
      await call('Input.dispatchKeyEvent', { type: 'keyUp', key, ...options })
    },

    async type(text) {
      for (const char of text) {
        await call('Input.dispatchKeyEvent', { type: 'keyDown', text: char })
        await call('Input.dispatchKeyEvent', { type: 'keyUp' })
      }
    },
  }
}

/** Tunggu sampai peramban siap menerima koneksi CDP. */
export async function waitForBrowser(endpoint, attempts = 20) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${endpoint}/json/version`)

      return (await response.json()).webSocketDebuggerUrl
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  throw new Error(`Chromium tidak merespons di ${endpoint}`)
}
