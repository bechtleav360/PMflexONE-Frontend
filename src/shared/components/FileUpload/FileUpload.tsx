import * as React from 'react'

import { useTranslation } from 'react-i18next'

import { FileUploadDropzone } from './FileUploadDropzone'
import { FileUploadList } from './FileUploadList'
import type { FileUploadLabels, FileUploadProps } from './FileUploadTypes'
import { appendUniqueFiles, createDefaultLabels, useControllableFiles } from './fileUploadUtils'

export type { FileUploadLabels, FileUploadProps } from './FileUploadTypes'

/**
 * Shared file upload component with drag-and-drop, manual selection, and file actions.
 *
 * @param props - File upload configuration.
 * @returns The rendered upload widget.
 */
export function FileUpload(props: FileUploadProps) {
  const {
    files,
    defaultFiles,
    onFilesChange,
    accept,
    disabled = false,
    className,
    dropzoneClassName,
    listClassName,
    itemClassName,
    buttonClassName,
    labels,
    onFileOpen,
  } = props
  const { t } = useTranslation()
  const [statusMessage, setStatusMessage] = React.useState('')
  const [currentFiles, setCurrentFiles] = useControllableFiles({
    files,
    defaultFiles,
    onFilesChange,
  })

  const mergedLabels = React.useMemo(
    () => ({ ...createDefaultLabels(t), ...labels }) satisfies FileUploadLabels,
    [labels, t],
  )

  const formatStatusMessage = React.useCallback(
    (action: 'added' | 'removed', actionCount: number, totalCount: number) => {
      return t(`shared.fileUpload.status.${action}`, {
        count: actionCount,
        totalCount,
      })
    },
    [t],
  )

  return (
    <div className={className}>
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage}
      </p>
      <FileUploadDropzone
        accept={accept}
        disabled={disabled}
        dropzoneClassName={dropzoneClassName}
        buttonClassName={buttonClassName}
        labels={mergedLabels}
        onFilesAccepted={(acceptedFiles) => {
          if (!acceptedFiles.length) {
            return
          }

          const { files: nextFiles, addedCount } = appendUniqueFiles(currentFiles, acceptedFiles)

          if (!addedCount) {
            return
          }

          setCurrentFiles(nextFiles)
          setStatusMessage(formatStatusMessage('added', addedCount, nextFiles.length))
        }}
      />
      <FileUploadList
        files={currentFiles}
        disabled={disabled}
        labels={mergedLabels}
        listClassName={listClassName}
        itemClassName={itemClassName}
        onFileOpen={onFileOpen}
        onRemove={(index) => {
          const nextFiles = currentFiles.filter((_, currentIndex) => currentIndex !== index)

          setCurrentFiles(nextFiles)
          setStatusMessage(formatStatusMessage('removed', 1, nextFiles.length))
        }}
      />
    </div>
  )
}
