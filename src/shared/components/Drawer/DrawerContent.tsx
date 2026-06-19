import * as React from 'react'

import * as DialogPrimitive from '@radix-ui/react-dialog'

import { cn } from '@/shared/lib/utils'

import { DrawerOverlay } from './DrawerOverlay'

interface DrawerContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  side?: 'left' | 'right'
}

/**
 * Drawer panel that slides in from the left or right edge of the viewport.
 * The close button lives in `DrawerHeader`; consumers not using `DrawerHeader` must
 * include their own `DialogPrimitive.Close`.
 * @param props - Radix `Content` props plus a `side` variant.
 * @param props.side - Which edge to slide from: `right` (default) | `left`.
 * @returns The portal-mounted drawer panel.
 */
const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ side = 'right', className, children, onInteractOutside, ...props }, ref) => {
  const sideClasses =
    side === 'right'
      ? 'right-0 border-l data-[state=closed]:translate-x-full data-[state=open]:translate-x-0 sm:rounded-l-[12px]'
      : 'left-0 border-r data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 sm:rounded-r-[12px]'

  return (
    <DialogPrimitive.Portal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'bg-card text-card-foreground fixed top-0 z-50 flex h-full w-full max-w-5xl flex-col border shadow-lg',
          'overflow-hidden transition-transform duration-300 ease-in-out outline-none',
          sideClasses,
          className,
        )}
        onInteractOutside={(e) => {
          // Sonner toasts are portalled outside the drawer but interact via pointer events.
          // Prevent those interactions from triggering the drawer's outside-click close.
          // Coupled to Sonner's `data-sonner-toaster` attribute — pin sonner version if this breaks.
          if ((e.target as Element)?.closest('[data-sonner-toaster]')) {
            e.preventDefault()
            return
          }
          onInteractOutside?.(e)
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
})
DrawerContent.displayName = DialogPrimitive.Content.displayName

export { DrawerContent }
