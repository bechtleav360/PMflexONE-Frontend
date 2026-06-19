import type { ReactNode } from 'react'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

interface EditEntryDialogShellProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  loadingText: string
  loadErrorText: string
  isPending: boolean
  isError: boolean
  ready: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: ReactNode
  footer?: ReactNode
}

/**
 * Generic shell for edit-entry dialogs. Renders the dialog frame, header,
 * loading/error states, and the form once the entry is ready.
 *
 * @param props - Shell props.
 * @param props.isOpen - Whether the dialog is open.
 * @param props.onClose - Called when the dialog requests to close.
 * @param props.title - Dialog title text.
 * @param props.description - Dialog description text.
 * @param props.loadingText - Text shown while the entry is loading.
 * @param props.loadErrorText - Text shown when the entry failed to load.
 * @param props.isPending - True while the entry is being fetched.
 * @param props.isError - True when the entry fetch failed.
 * @param props.ready - True when the entry is available and the form should render.
 * @param props.size - Dialog content size variant.
 * @param props.children - Form to render when `ready` is true.
 * @returns The rendered dialog shell.
 */
export function EditEntryDialogShell({
  isOpen,
  onClose,
  title,
  description,
  loadingText,
  loadErrorText,
  isPending,
  isError,
  ready,
  size,
  children,
  footer,
}: EditEntryDialogShellProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isPending && <p className="text-muted-foreground text-sm">{loadingText}</p>}
          {isError && (
            <p
              className="text-destructive text-sm"
              role="alert"
            >
              {loadErrorText}
            </p>
          )}
          {ready && children}
        </DialogBody>
        {footer != null && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
