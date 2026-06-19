import * as React from 'react'

import { Upload } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

import type { FileUploadLabels } from './FileUploadTypes'

interface FileUploadDropzoneViewProps {
  accept?: string
  className?: string
  dropzoneClassName?: string
  buttonClassName?: string
  labels: FileUploadLabels
  disabled: boolean
  isDragging: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  openFileDialog: () => void
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleDragEnter: (event: React.DragEvent<HTMLButtonElement>) => void
  handleDragOver: (event: React.DragEvent<HTMLButtonElement>) => void
  handleDragLeave: (event: React.DragEvent<HTMLButtonElement>) => void
  handleDrop: (event: React.DragEvent<HTMLButtonElement>) => void
}

/**
 * Pure view layer for the file upload dropzone area.
 * @param props - Dropzone rendering props and event handlers.
 * @param props.accept - Accepted file types forwarded to the hidden input.
 * @param props.className - Wrapper class name.
 * @param props.dropzoneClassName - Class applied to the dropzone button.
 * @param props.buttonClassName - Class applied to the inner button element.
 * @param props.labels - Accessible and visible label strings.
 * @param props.disabled - Whether the dropzone is non-interactive.
 * @param props.isDragging - Whether a file is being dragged over the zone.
 * @param props.inputRef - Ref to the hidden file input.
 * @param props.openFileDialog - Opens the native file picker.
 * @param props.handleInputChange - Handles files selected via the input.
 * @param props.handleDragEnter - DragEnter handler.
 * @param props.handleDragOver - DragOver handler.
 * @param props.handleDragLeave - DragLeave handler.
 * @param props.handleDrop - Drop handler.
 * @returns The rendered dropzone button and hidden file input.
 */
export function FileUploadDropzoneView({
  accept,
  className,
  dropzoneClassName,
  buttonClassName,
  labels,
  disabled,
  isDragging,
  inputRef,
  openFileDialog,
  handleInputChange,
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDrop,
}: FileUploadDropzoneViewProps) {
  return (
    <div className={cn('gap-lg flex flex-col', className)}>
      <button
        type="button"
        aria-label={labels.dropzoneTitle}
        className={cn(
          'bg-muted border-border py-2xl flex w-full flex-col items-center gap-[10px] rounded-[10px] border-2 border-dashed px-5 text-center transition-colors',
          'hover:border-primary hover:bg-primary-soft',
          isDragging && 'border-primary bg-primary-soft',
          disabled && 'cursor-not-allowed opacity-60',
          dropzoneClassName,
        )}
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={disabled}
      >
        <div className="bg-card border-border text-muted-foreground flex h-[44px] w-[44px] items-center justify-center rounded-[10px] border">
          <Upload
            className="h-5 w-5"
            aria-hidden="true"
          />
        </div>

        <div className="gap-xs flex flex-col items-center">
          <p className="text-foreground text-sm font-semibold">{labels.dropzoneTitle}</p>
          <p className="text-muted-foreground text-xs">{labels.dropzoneDescription}</p>
        </div>

        <span
          className={cn(
            'border-border bg-card text-foreground px-md mt-1 inline-flex h-9 items-center rounded-sm border text-xs font-medium transition-colors',
            'hover:border-border-strong hover:bg-muted',
            buttonClassName,
          )}
        >
          {labels.button}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}
