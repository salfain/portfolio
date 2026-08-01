'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { type ComponentPropsWithoutRef, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

export const Drawer = DialogPrimitive.Root
export const DrawerTrigger = DialogPrimitive.Trigger
export const DrawerClose = DialogPrimitive.Close

type Side = 'left' | 'right'

type DrawerContentProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  side?: Side
}

export function DrawerContent({
  className,
  children,
  side = 'right',
  ...props
}: DrawerContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-black/50',
          'data-[state=open]:animate-in data-[state=open]:fade-in',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out',
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          'sk-raised-lg fixed top-0 z-50 h-dvh w-full max-w-sm p-6',
          'bg-surface outline-none',
          side === 'right' &&
            'right-0 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
          side === 'left' &&
            'left-0 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DrawerTitle({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <DialogPrimitive.Title
      className={cn('font-display text-lg font-semibold', className)}
    >
      {children}
    </DialogPrimitive.Title>
  )
}

export function DrawerDescription({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <DialogPrimitive.Description
      className={cn('mt-2 text-sm text-muted', className)}
    >
      {children}
    </DialogPrimitive.Description>
  )
}
