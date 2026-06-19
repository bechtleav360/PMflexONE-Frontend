import { useEffect, useState, type ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { Button, Popover, PopoverAnchor, PopoverContent } from '@/shared/components'

const SESSION_KEY = 'show-sidebar-hint'

interface SidebarOnboardingHintProps {
  children: ReactNode
}

const CUSTOM_EVENT = 'p1ng:show-sidebar-hint'

function scheduleHint(setOpen: (v: boolean) => void): () => void {
  sessionStorage.removeItem(SESSION_KEY)
  const id = window.setTimeout(() => setOpen(true), 800)
  return () => window.clearTimeout(id)
}

/**
 * Wraps its children with a one-time onboarding popover anchored to the wrapped element.
 * Triggered either on mount (sessionStorage flag from a previous navigation) or via the
 * p1ng:show-sidebar-hint custom event dispatched by useCreateBoard when the SPA stays mounted.
 * @param root0 - Component props.
 * @param root0.children - The element to anchor the onboarding popover to.
 * @returns A Popover-wrapped version of the provided children.
 */
export function SidebarOnboardingHint({ children }: SidebarOnboardingHintProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  // Case 1: component mounts after a full-page navigation with the flag already set
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) !== 'true') return
    return scheduleHint(setOpen)
  }, [])

  // Case 2: component is already mounted when the board is created (SPA, no navigation)
  useEffect(() => {
    let cancelHint: (() => void) | undefined
    function handleEvent() {
      cancelHint?.()
      cancelHint = scheduleHint(setOpen)
    }
    window.addEventListener(CUSTOM_EVENT, handleEvent)
    return () => {
      window.removeEventListener(CUSTOM_EVENT, handleEvent)
      cancelHint?.()
    }
  }, [])

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent
        side="left"
        sideOffset={8}
        className="w-64"
        onInteractOutside={() => setOpen(false)}
      >
        <p className="mb-3 text-sm">
          {t(
            'features.workItem.board.sidebarHint.text',
            "Here you'll find your active tasks and the archive.",
          )}
        </p>
        <Button
          size="sm"
          className="w-full"
          onClick={() => setOpen(false)}
        >
          {t('features.workItem.board.sidebarHint.dismiss', 'Got it ✓')}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
