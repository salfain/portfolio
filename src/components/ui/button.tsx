import { Slot, Slottable } from '@radix-ui/react-slot'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

/**
 * `sk-raised` + `sk-pressable` memberi tombol permukaan terangkat yang
 * benar-benar turun 1px saat ditekan. `ghost` sengaja TIDAK terangkat —
 * tombol tersier yang ikut menonjol membuat hierarki visualnya rata dan
 * pengguna kehilangan petunjuk mana aksi utamanya.
 */
const variantClasses: Record<Variant, string> = {
  primary: [
    'sk-raised sk-pressable bg-primary text-primary-foreground',
    'hover:opacity-90',
  ].join(' '),
  secondary: [
    'sk-raised sk-pressable bg-surface text-foreground border border-border',
    'hover:bg-elevated',
  ].join(' '),
  ghost: ['sk-pressable bg-transparent text-foreground', 'hover:bg-elevated'].join(' '),
  danger: [
    'sk-raised sk-pressable bg-danger text-white',
    'hover:opacity-90',
  ].join(' '),
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  asChild?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full',
          'font-medium',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        ) : null}
        {/* `Slottable` menandai anak mana yang menerima prop dari Slot saat
            `asChild`. Tanpa ini, Slot melihat dua anak (spinner + children)
            dan melempar "Expected a single React element child" — yang baru
            terlihat saat asChild benar-benar dipakai. Di luar Slot,
            Slottable hanya merender anaknya apa adanya. */}
        <Slottable>{children}</Slottable>
      </Comp>
    )
  },
)

Button.displayName = 'Button'
