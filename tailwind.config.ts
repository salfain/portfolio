import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        /* Tangga teks sekunder dari handoff: text-2 → muted → faint. */
        'text-2': 'rgb(var(--text-2) / <alpha-value>)',
        'text-3': 'rgb(var(--text-3) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        'muted-2': 'rgb(var(--muted-2) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
        'faint-2': 'rgb(var(--faint-2) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'border-soft': 'rgb(var(--border-soft) / <alpha-value>)',
        'border-med': 'rgb(var(--border-med) / <alpha-value>)',
        'border-hover': 'rgb(var(--border-hover) / <alpha-value>)',
        /**
         * Garis batas kontrol yang bisa disentuh pengguha — input, select,
         * textarea. Terpisah dari `border` karena WCAG 1.4.11 menuntut 3:1
         * untuk batas komponen, dan garis pemisah dekoratif yang setipis itu
         * tidak akan pernah memenuhinya tanpa terlihat berat di seluruh
         * halaman.
         */
        'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          hi: 'rgb(var(--primary-hi) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        /* Skala redesign 2026. Judul memakai Instrument Serif, jadi berat
           font-nya tetap 400 — menebalkan serif ini merusak bentuknya. */
        display: [
          'clamp(52px,7.4vw,104px)',
          { lineHeight: '0.96', letterSpacing: '-0.02em', fontWeight: '400' },
        ],
        h1: [
          'clamp(44px,6vw,80px)',
          { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '400' },
        ],
        h2: [
          'clamp(30px,3.4vw,38px)',
          { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '400' },
        ],
        body: ['17px', { lineHeight: '1.65' }],
        label: ['11px', { lineHeight: '1.4', letterSpacing: '0.12em' }],
      },
      maxWidth: {
        container: '1180px',
        prose: '76ch',
      },
      boxShadow: {
        nav: 'var(--shadow-nav)',
        modal: 'var(--shadow-modal)',
      },
      /**
       * Radius redesign 2026: kontrol kecil 8–12, input 12–14,
       * kartu 18–22, modal 22–24. Chip dan tombol memakai `rounded-full`.
       *
       * Seluruh skala Tailwind diarahkan ke tiga nilai ini, bukan
       * menyunting ~100 pemakaian `rounded-*` satu per satu. Hasilnya sama
       * — tidak ada radius di luar sistem — tapi tanpa risiko ada satu
       * berkas yang terlewat dan tetap memakai sudut lama.
       *
       * `full` sengaja dipertahankan untuk bentuk yang memang lingkaran:
       * titik indikator, spinner, dan batang skeleton.
       */
      borderRadius: {
        sm: '8px',
        DEFAULT: '10px',
        md: '12px',
        lg: '14px',
        xl: '18px',
        '2xl': '20px',
        '3xl': '22px',
      },
      spacing: {
        /* Ritme jarak Glassline, tersedia sebagai token bernama. */
        'gl-sm': '8px',
        'gl-md': '16px',
        'gl-lg': '32px',
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
