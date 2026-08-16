import { type InputHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/lib/cn'

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-md border border-border-strong bg-input px-3.5 py-3',
      'text-foreground placeholder:text-faint',
      'transition-colors focus:border-primary',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'
