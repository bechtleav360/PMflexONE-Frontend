import * as React from 'react'

import { ExternalLink, FileText, X } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

import type { FileUploadLabels } from './FileUploadTypes'
import { formatFileSize, openFile } from './fileUploadUtils'

interface FileUploadListProps {
  files: File[]
  disabled?: boolean
  labels: FileUploadLabels
  listClassName?: string
  itemClassName?: string
  onFileOpen?: (file: File) => void
  onRemove: (index: number) => void
}

/**
 * Renders the list of selected files with remove and open actions.
 * @param props - File list props.
 * @param props.files - Array of File objects to display.
 * @param props.disabled - Whether actions are disabled.
 * @param props.labels - Accessible label strings.
 * @param props.listClassName - Class applied to the list container.
 * @param props.itemClassName - Class applied to each list item.
 * @param props.onFileOpen - Optional callback when a file is opened.
 * @param props.onRemove - Called with the file index when the remove button is clicked.
 * @returns A list of file rows, or null when the list is empty.
 */
export function FileUploadList({
  files,
  disabled = false,
  labels,
  listClassName,
  itemClassName,
  onFileOpen,
  onRemove,
}: FileUploadListProps) {
  const handleOpenFile = React.useCallback(
    (file: File) => {
      if (onFileOpen) {
        onFileOpen(file)
        return
      }

      openFile(file)
    },
    [onFileOpen],
  )

  return (
    <div className={cn('gap-sm flex flex-col', listClassName)}>
      {files.length > 0 ? (
        <p className="text-muted-foreground px-0.5 text-[12px] font-semibold tracking-[.02em]">
          {labels.fileCount(files.length)}
        </p>
      ) : null}

      {files.length === 0 ? (
        <div className="px-lg text-muted-foreground rounded-lg border border-dashed py-3.5 text-center text-[13px]">
          {labels.emptyState}
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              className={cn(
                'gap-md border-border bg-card pl-md hover:border-border-strong hover:bg-muted flex items-center rounded-lg border pt-[10px] pr-[10px] pb-[10px] transition-colors',
                itemClassName,
              )}
            >
              <div className="border-border bg-muted text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                <FileText
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[13px] font-semibold">{file.name}</span>
                <span className="text-muted-foreground text-[11px] whitespace-nowrap">
                  {[file.type || labels.unknownType, formatFileSize(file.size)].join(' · ')}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => handleOpenFile(file)}
                  disabled={disabled}
                  aria-label={`${labels.open}: ${file.name}`}
                  className="text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent transition-[background,color,border-color] focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ExternalLink
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  disabled={disabled}
                  aria-label={`${labels.remove}: ${file.name}`}
                  className="text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent transition-[background,color,border-color] focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
