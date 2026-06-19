import * as DialogPrimitive from '@radix-ui/react-dialog'

import { DrawerBody } from './DrawerBody'
import { DrawerContent } from './DrawerContent'
import { DrawerDescription } from './DrawerDescription'
import { DrawerFooter } from './DrawerFooter'
import { DrawerHeader } from './DrawerHeader'
import { DrawerOverlay } from './DrawerOverlay'
import { DrawerTitle } from './DrawerTitle'

const Drawer = DialogPrimitive.Root
const DrawerTrigger = DialogPrimitive.Trigger
const DrawerPortal = DialogPrimitive.Portal
const DrawerClose = DialogPrimitive.Close

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
}
