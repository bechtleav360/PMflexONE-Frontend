import * as React from 'react'

import type { TFunction } from 'i18next'

import type { FileUploadLabels, FileUploadProps } from './FileUploadTypes'

/**
 * Builds the localized fallback labels for the file upload component.
 *
 * @param t - Translation function from react-i18next.
 * @returns Localized default labels.
 */
export function createDefaultLabels(t: TFunction): FileUploadLabels {
  return {
    button: t('shared.fileUpload.button'),
    dropzoneTitle: t('shared.fileUpload.dropzoneTitle'),
    dropzoneDescription: t('shared.fileUpload.dropzoneDescription'),
    emptyState: t('shared.fileUpload.emptyState'),
    open: t('shared.fileUpload.open'),
    remove: t('shared.fileUpload.remove'),
    fileCount: (count: number) => t('shared.fileUpload.fileCount', { count }),
    unknownType: t('shared.fileUpload.unknownType'),
  }
}

function createFileIdentity(file: File) {
  return [file.name, file.size, file.lastModified, file.type, file.webkitRelativePath ?? ''].join(
    '\u0000',
  )
}

/**
 * Removes duplicate files while preserving the first occurrence of each file.
 *
 * @param files - File list to normalize.
 * @returns Files with duplicate entries removed.
 */
export function dedupeFiles(files: File[]) {
  const seen = new Set<string>()

  return files.filter((file) => {
    const identity = createFileIdentity(file)

    if (seen.has(identity)) {
      return false
    }

    seen.add(identity)
    return true
  })
}

/**
 * Appends new files to an existing list while dropping duplicates.
 *
 * @param existingFiles - Files already selected.
 * @param incomingFiles - Files to add.
 * @returns The merged files and how many new files were added.
 */
export function appendUniqueFiles(existingFiles: File[], incomingFiles: FileList | File[]) {
  const nextFiles = [...existingFiles]
  const seen = new Set(existingFiles.map(createFileIdentity))
  let addedCount = 0

  for (const file of incomingFiles) {
    const identity = createFileIdentity(file)

    if (seen.has(identity)) {
      continue
    }

    seen.add(identity)
    nextFiles.push(file)
    addedCount += 1
  }

  return {
    files: nextFiles,
    addedCount,
  }
}

/**
 * Keeps file upload state controllable while supporting an uncontrolled fallback.
 *
 * @param props - File state inputs.
 * @param props.files - Controlled file list.
 * @param props.defaultFiles - Initial file list for uncontrolled usage.
 * @param props.onFilesChange - Change callback invoked for either control mode.
 * @returns The current files and a setter that mirrors controlled or uncontrolled usage.
 */
export function useControllableFiles(
  props: Pick<FileUploadProps, 'files' | 'defaultFiles' | 'onFilesChange'>,
): readonly [File[], (nextFiles: React.SetStateAction<File[]>) => File[]] {
  const { files, defaultFiles = [], onFilesChange } = props
  const [internalFiles, setInternalFiles] = React.useState<File[]>(() => dedupeFiles(defaultFiles))
  const isControlled = files !== undefined
  const currentFiles = isControlled ? files : internalFiles

  const setFiles = React.useCallback(
    (nextFiles: React.SetStateAction<File[]>) => {
      const resolvedFiles =
        typeof nextFiles === 'function'
          ? nextFiles(isControlled ? (files ?? []) : internalFiles)
          : nextFiles

      if (!isControlled) {
        setInternalFiles(resolvedFiles)
      }

      onFilesChange?.(resolvedFiles)

      return resolvedFiles
    },
    [files, internalFiles, isControlled, onFilesChange],
  )

  return [currentFiles, setFiles] as const
}

/**
 * Filters incoming files using the shared accept-string parser.
 *
 * @param incomingFiles - Files received from the picker or drag-and-drop.
 * @param accept - HTML accept string used to filter files.
 * @returns Files that match the accept string.
 */
export function getAcceptedFiles(incomingFiles: FileList | File[], accept?: string) {
  return Array.from(incomingFiles).filter((file) => matchesAccept(file, accept))
}

/**
 * Checks whether a file matches an accept string.
 *
 * @param file - File to validate.
 * @param accept - HTML file input accept string.
 * @returns Whether the file should be accepted.
 */
export function matchesAccept(file: File, accept?: string) {
  if (!accept) {
    return true
  }

  const tokens = accept
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)

  if (!tokens.length) {
    return true
  }

  return tokens.some((token) => {
    if (token.startsWith('.')) {
      return file.name.toLowerCase().endsWith(token.toLowerCase())
    }

    if (token.endsWith('/*')) {
      return file.type.toLowerCase().startsWith(token.slice(0, -1).toLowerCase())
    }

    return file.type.toLowerCase() === token.toLowerCase()
  })
}

/**
 * Formats file sizes for display.
 *
 * @param bytes - Raw file size in bytes.
 * @returns A human-readable file size string.
 */
export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const units = ['KB', 'MB', 'GB', 'TB']
  let size = bytes / 1024
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size >= 10 ? Math.round(size) : size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Opens a local file in a new browser tab.
 *
 * @param file - File to preview.
 * @returns Nothing.
 */
export function openFile(file: File) {
  const url = URL.createObjectURL(file)
  const openedWindow = window.open(url, '_blank', 'noopener,noreferrer')

  if (openedWindow) {
    openedWindow.opener = null
  }

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}
