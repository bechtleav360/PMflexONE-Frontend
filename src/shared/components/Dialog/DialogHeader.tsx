import * as React from 'react'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/utils'

/**
 * Dialog header with a built-in close button.
 * Renders the title/description slot on the left and an X button on the right.
 * @param props - Div props for the header container.
 * @param props.className - Additional class names merged with the default layout classes.
 * @param props.children - Title/description content rendered on the left side.
 * @returns The rendered dialog header.
 */
function DialogHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'gap-md px-dialog-x pt-lg pb-md flex items-start justify-between border-b',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">{children}</div>
      <DialogPrimitive.Close className="text-muted-foreground hover:bg-muted hover:ring-border flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[7px] transition-colors hover:ring-1 hover:ring-inset focus:outline-none focus-visible:shadow-[var(--focus)] disabled:pointer-events-none">
        <X className="h-[15px] w-[15px]" />
        <span className="sr-only">{t('common.close')}</span>
      </DialogPrimitive.Close>
    </div>
  )
}

DialogHeader.displayName = 'DialogHeader'

export { DialogHeader }
