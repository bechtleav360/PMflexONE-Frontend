import { Download, Loader2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { Attachment } from '@/entities/work-item'
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components'

/** Props for {@link AttachmentItem}. */
export interface AttachmentItemProps {
  att: Attachment
  isOwner: boolean
  onDeleteRequest: (target: { id: string; version: number; name: string }) => void
}

/**
 * @param bytes - Raw byte count.
 * @returns Human-readable MB string with two decimal places.
 */
function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Single row in the attachment list with download/delete actions.
 *
 * @param root0 - Component props.
 * @param root0.att - The attachment record to display.
 * @param root0.isOwner - Whether the current user owns this attachment.
 * @param root0.onDeleteRequest - Called with the attachment target when delete is clicked.
 * @returns A list item element for one attachment.
 */
export function AttachmentItem({ att, isOwner, onDeleteRequest }: AttachmentItemProps) {
  const { t } = useTranslation()
  const uploaderName = att.creator ? `${att.creator.firstName} ${att.creator.lastName}` : null
  const uploadedOn = new Date(att.createdAt).toLocaleDateString()
  const fileSize = att.size != null ? formatBytes(att.size) : null
  const isEnriching = !att.fileName

  return (
    <li className="bg-card flex items-center justify-between rounded-md border px-3 py-2">
      <div className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 truncate text-sm font-medium">
          {att.fileName ?? (
            <span className="text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t('features.workItemAttachments.processing', 'Processing…')}
            </span>
          )}
        </span>
        <span className="text-muted-foreground text-xs">
          {[fileSize, uploaderName, uploadedOn].filter(Boolean).join(' · ')}
        </span>
      </div>

      <TooltipProvider delayDuration={300}>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                asChild
                disabled={isEnriching}
                aria-label={t('common.download')}
              >
                <a
                  href={att.storageKey ?? '#'}
                  download={att.fileName ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.download', 'Download')}</TooltipContent>
          </Tooltip>

          {isOwner && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={t('common.delete', 'Delete')}
                  onClick={() =>
                    onDeleteRequest({ id: att.id, version: att.version, name: att.fileName ?? '' })
                  }
                >
                  <Trash2 className="text-destructive h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('common.delete', 'Delete')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </li>
  )
}
