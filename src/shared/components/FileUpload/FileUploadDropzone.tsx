import { FileUploadDropzoneView } from './FileUploadDropzoneView'
import type { FileUploadLabels } from './FileUploadTypes'
import { useFileUploadDropzone } from './useFileUploadDropzone'

interface FileUploadDropzoneProps {
  accept?: string
  disabled?: boolean
  className?: string
  dropzoneClassName?: string
  buttonClassName?: string
  labels: FileUploadLabels
  onFilesAccepted: (files: File[]) => void
}

/**
 * Drag-and-drop file picker surface used by the shared file upload component.
 *
 * @param props - Dropzone configuration.
 * @param props.accept - HTML accept string used to filter files.
 * @param props.disabled - Whether user interaction is disabled.
 * @param props.className - Optional wrapper class name.
 * @param props.dropzoneClassName - Optional dropzone class name.
 * @param props.buttonClassName - Optional file-picker button class name.
 * @param props.labels - Localized labels used in the UI.
 * @param props.onFilesAccepted - Callback invoked with accepted files.
 * @returns A clickable dropzone and file input.
 */
export function FileUploadDropzone({
  accept,
  disabled = false,
  className,
  dropzoneClassName,
  buttonClassName,
  labels,
  onFilesAccepted,
}: FileUploadDropzoneProps) {
  const {
    inputRef,
    isDragging,
    openFileDialog,
    handleInputChange,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useFileUploadDropzone({
    accept,
    disabled,
    onFilesAccepted,
  })

  return (
    <FileUploadDropzoneView
      accept={accept}
      className={className}
      dropzoneClassName={dropzoneClassName}
      buttonClassName={buttonClassName}
      labels={labels}
      disabled={disabled}
      isDragging={isDragging}
      inputRef={inputRef}
      openFileDialog={openFileDialog}
      handleInputChange={handleInputChange}
      handleDragEnter={handleDragEnter}
      handleDragOver={handleDragOver}
      handleDragLeave={handleDragLeave}
      handleDrop={handleDrop}
    />
  )
}
