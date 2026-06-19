import * as DialogPrimitive from '@radix-ui/react-dialog'

import { DialogBody } from './DialogBody'
import { DialogContent } from './DialogContent'
import { DialogDescription } from './DialogDescription'
import { DialogFooter } from './DialogFooter'
import { DialogHeader } from './DialogHeader'
import { DialogOverlay } from './DialogOverlay'
import { DialogTitle } from './DialogTitle'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
