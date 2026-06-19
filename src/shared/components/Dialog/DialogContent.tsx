import * as React from 'react'

import * as DialogPrimitive from '@radix-ui/react-dialog'

import { cn } from '@/shared/lib/utils'

import { DialogOverlay } from './DialogOverlay'

const sizeClasses = {
  xs: 'max-w-sm',
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
} as const

type DialogSize = keyof typeof sizeClasses

/**
 * Dialog content container. Renders the modal surface, overlay, and animation.
 * **Close button**: the close button lives in `DialogHeader`, not here.
 * Consumers that do not use `DialogHeader` must include their own `DialogPrimitive.Close`.
 * @param props - Radix `Content` props plus an optional `size` variant.
 * @param props.size - Controls max-width: `xs` | `sm` | `md` (default) | `lg` | `xl` | `full`.
 * @returns The portal-mounted dialog surface.
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { size?: DialogSize }
>(({ className, children, size = 'md', ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      aria-describedby={undefined}
      ref={ref}
      className={cn(
        'bg-card text-card-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 flex max-h-[90vh] w-full translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden border shadow-lg duration-200 sm:rounded-[12px]',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

export { DialogContent }
