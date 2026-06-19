import { useState, type KeyboardEvent } from 'react'

import { Check, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components'

/**
 * Copy text to clipboard, falling back to execCommand if the Clipboard API is unavailable.
 * @param id - The text to copy.
 * @param onSuccess - Called when the copy succeeds.
 */
async function copyToClipboard(id: string, onSuccess: () => void): Promise<void> {
  try {
    await navigator.clipboard.writeText(id)
    onSuccess()
    return
  } catch {
    /* fall through to execCommand */
  }
  try {
    const container =
      document.querySelector('[data-vaul-drawer-content]') ??
      document.querySelector('[role="dialog"]') ??
      document.body
    const el = document.createElement('textarea')
    el.value = id
    el.style.cssText =
      'position:absolute;top:0;left:0;width:1px;height:1px;opacity:0.01;pointer-events:none'
    container.appendChild(el)
    el.focus({ preventScroll: true })
    el.select()
    const ok = document.execCommand('copy')
    container.removeChild(el)
    if (ok) onSuccess()
  } catch {
    /* nothing left to try */
  }
}

interface TaskIdCellProps {
  id: string
}

/**
 * Displays a truncated work item ID with a click-to-copy button and Ctrl+C shortcut.
 * @param root0 - Component props.
 * @param root0.id - The work item ID to display.
 * @returns The task ID cell element.
 */
export function TaskIdCell({ id }: TaskIdCellProps) {
  const { t } = useTranslation()
  const [idCopied, setIdCopied] = useState(false)

  function triggerCopy() {
    void copyToClipboard(id, () => {
      setIdCopied(true)
      setTimeout(() => setIdCopied(false), 1500)
    })
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      triggerCopy()
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="focus-visible:ring-ring flex items-center gap-1.5 rounded focus-visible:ring-1 focus-visible:outline-none"
            aria-label={t('entities.workItem.copyId', 'Copy Task ID')}
            onKeyDown={handleKeyDown}
            onClick={triggerCopy}
          >
            <div className="relative max-w-45 cursor-default overflow-hidden font-mono text-xs">
              <span
                className="block truncate select-none"
                aria-hidden
              >
                {id}
              </span>
              <span
                className="absolute inset-0 text-transparent"
                style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
              >
                {id}
              </span>
            </div>
            {idCopied ? (
              <Check className="text-success h-3.5 w-3.5 shrink-0" />
            ) : (
              <Copy className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            )}
            {idCopied && (
              <span className="text-success font-sans text-[11px]">
                {t('entities.workItem.fields.copied', 'Copied!')}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="border-border bg-popover text-popover-foreground rounded-md border-[0.5px] font-mono text-xs"
        >
          {id}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
