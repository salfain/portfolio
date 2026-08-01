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
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
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
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        /* Skala Glassline. `label` memakai mono dan tracking netral. */
        display: ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '600' }],
        h1: ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        body: ['0.95rem', { lineHeight: '1.55' }],
        label: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0' }],
      },
      maxWidth: {
        container: '1280px',
        prose: '76ch',
      },
      /**
       * Radius Glassline: sm 6 · md 10 · lg 16.
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
        sm: '6px',
        DEFAULT: '6px',
        md: '10px',
        lg: '16px',
        xl: '10px',
        '2xl': '16px',
        '3xl': '16px',
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
