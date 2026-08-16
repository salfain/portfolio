import { type LabelHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/lib/cn'

export const Label = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      // Label form memakai mono huruf besar, sejalan dengan seluruh
      // metadata di situs ini.
      'block font-mono text-[11px] uppercase tracking-[0.12em] text-muted',
      className,
    )}
    {...props}
  />
))
Label.displayName = 'Label'
