import * as React from 'react'

import { getAcceptedFiles } from './fileUploadUtils'

interface UseFileUploadDropzoneProps {
  accept?: string
  disabled?: boolean
  onFilesAccepted: (files: File[]) => void
}

function shouldHandleDropzoneInteraction(disabled: boolean) {
  return !disabled
}

function clearDragState(
  dragCounterRef: React.RefObject<number>,
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>,
) {
  dragCounterRef.current = 0
  setIsDragging(false)
}

function acceptAndNotifyFiles(
  incomingFiles: FileList | File[],
  accept: string | undefined,
  onFilesAccepted: (files: File[]) => void,
) {
  const acceptedFiles = getAcceptedFiles(incomingFiles, accept)

  if (acceptedFiles.length > 0) {
    onFilesAccepted(acceptedFiles)
  }
}

/**
 * Encapsulates the interactive state and event handlers for the file upload dropzone.
 *
 * @param props - Dropzone configuration.
 * @param props.accept - HTML accept string used to filter selected files.
 * @param props.disabled - Whether the dropzone should ignore user interaction.
 * @param props.onFilesAccepted - Callback invoked with accepted files from the picker or drop event.
 * @returns Refs, state, and handlers used by the dropzone view.
 */
export function useFileUploadDropzone(props: UseFileUploadDropzoneProps) {
  const { accept, disabled = false, onFilesAccepted } = props
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dragCounterRef = React.useRef(0)
  const [isDragging, setIsDragging] = React.useState(false)

  const { openFileDialog, handleInputChange } = useFileUploadDropzoneInputHandlers({
    accept,
    disabled,
    onFilesAccepted,
    inputRef,
  })
  const { handleDragEnter, handleDragOver, handleDragLeave, handleDrop } =
    useFileUploadDropzoneDragHandlers({
      accept,
      disabled,
      onFilesAccepted,
      dragCounterRef,
      setIsDragging,
    })

  return {
    inputRef,
    isDragging,
    openFileDialog,
    handleInputChange,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}

type UseFileUploadDropzoneHandlersProps = Pick<
  UseFileUploadDropzoneProps,
  'accept' | 'disabled' | 'onFilesAccepted'
> & {
  inputRef: React.RefObject<HTMLInputElement | null>
}

type UseFileUploadDropzoneDragHandlersProps = Pick<
  UseFileUploadDropzoneProps,
  'accept' | 'disabled' | 'onFilesAccepted'
> & {
  dragCounterRef: React.RefObject<number>
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>
}

function useFileUploadDropzoneInputHandlers({
  accept,
  disabled = false,
  onFilesAccepted,
  inputRef,
}: UseFileUploadDropzoneHandlersProps) {
  const openFileDialog = React.useCallback(() => {
    if (!shouldHandleDropzoneInteraction(disabled)) {
      return
    }

    inputRef.current?.click()
  }, [disabled, inputRef])

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        acceptAndNotifyFiles(event.target.files, accept, onFilesAccepted)
      }

      event.target.value = ''
    },
    [accept, onFilesAccepted],
  )

  return {
    openFileDialog,
    handleInputChange,
  }
}

function useFileUploadDropzoneDragHandlers({
  accept,
  disabled = false,
  onFilesAccepted,
  dragCounterRef,
  setIsDragging,
}: UseFileUploadDropzoneDragHandlersProps) {
  const handleDragEnter = React.useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      if (!shouldHandleDropzoneInteraction(disabled)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      dragCounterRef.current += 1
      setIsDragging(true)
    },
    [disabled, dragCounterRef, setIsDragging],
  )

  const handleDragOver = React.useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      if (!shouldHandleDropzoneInteraction(disabled)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      event.dataTransfer.dropEffect = 'copy'
    },
    [disabled],
  )

  const handleDragLeave = React.useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      if (!shouldHandleDropzoneInteraction(disabled)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      dragCounterRef.current -= 1

      if (dragCounterRef.current <= 0) {
        clearDragState(dragCounterRef, setIsDragging)
      }
    },
    [disabled, dragCounterRef, setIsDragging],
  )

  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      if (!shouldHandleDropzoneInteraction(disabled)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      clearDragState(dragCounterRef, setIsDragging)

      if (event.dataTransfer.files.length > 0) {
        acceptAndNotifyFiles(event.dataTransfer.files, accept, onFilesAccepted)
      }
    },
    [accept, disabled, dragCounterRef, onFilesAccepted, setIsDragging],
  )

  return {
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
