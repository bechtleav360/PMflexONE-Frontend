/**
 * Localized labels for the shared file upload component.
 *
 * @property button - Label for the file selection action.
 * @property dropzoneTitle - Main dropzone heading.
 * @property dropzoneDescription - Supporting copy shown under the title.
 * @property emptyState - Message shown when no files are selected.
 * @property open - Accessible label for the open-file action.
 * @property remove - Accessible label for the remove-file action.
 * @property fileCount - Function that formats the selected file count.
 * @property unknownType - Fallback label for files without a MIME type.
 */
export type FileUploadLabels = {
  button: string
  dropzoneTitle: string
  dropzoneDescription: string
  emptyState: string
  open: string
  remove: string
  fileCount: (count: number) => string
  unknownType: string
}

/**
 * Public props for the shared file upload component.
 *
 * @property files - Controlled file list.
 * @property defaultFiles - Initial file list for uncontrolled usage.
 * @property onFilesChange - Change callback invoked for either control mode.
 * @property accept - HTML accept string used to filter files.
 * @property disabled - Whether the component is disabled.
 * @property className - Optional wrapper class name.
 * @property dropzoneClassName - Optional dropzone class name.
 * @property listClassName - Optional file list class name.
 * @property itemClassName - Optional file item class name.
 * @property buttonClassName - Optional file-picker button class name.
 * @property labels - Custom labels for the file upload component.
 * @property onFileOpen - Optional file open callback.
 */
export type FileUploadProps = {
  files?: File[]
  defaultFiles?: File[]
  onFilesChange?: (files: File[]) => void
  accept?: string
  disabled?: boolean
  className?: string
  dropzoneClassName?: string
  listClassName?: string
  itemClassName?: string
  buttonClassName?: string
  labels?: Partial<FileUploadLabels>
  onFileOpen?: (file: File) => void
}
