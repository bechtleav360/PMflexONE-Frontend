import type { ReactNode } from 'react'

import { toast, type ExternalToast, type ToasterProps } from 'sonner'

type ToastMessage = Parameters<typeof toast>[0]
/**
 * Shared Sonner toast options for the convenience helpers.
 */
export type ToastOptions = ExternalToast

/**
 * Options for promise-based toasts with loading, success, and error states.
 * @template Data - The resolved promise data type.
 */
export type ToastPromiseOptions<Data = unknown> = {
  loading?: ReactNode
  success?: ReactNode | ((data: Data) => ReactNode | string | Promise<ReactNode | string>)
  error?: ReactNode | ((error: unknown) => ReactNode | string | Promise<ReactNode | string>)
  description?: ReactNode | ((data: Data) => ReactNode | string | Promise<ReactNode | string>)
  finally?: () => void | Promise<void>
} & Omit<ToastOptions, 'description'>

const DEFAULT_TOAST_OPTIONS = {
  classNames: {
    toast: '',
    title: '',
    description: '',
    actionButton: 'bg-primary text-primary-foreground',
    cancelButton: 'bg-secondary text-secondary-foreground',
    closeButton: 'bg-transparent hover:bg-muted rounded-[6px]',
  },
} satisfies NonNullable<ToasterProps['toastOptions']>

/**
 * Merges user-defined toast options with the shared design defaults.
 * @param toastOptions - Optional Sonner toast options.
 * @returns The merged toast options.
 */
export function mergeToastOptions(
  toastOptions?: ToasterProps['toastOptions'],
): NonNullable<ToasterProps['toastOptions']> {
  return {
    ...DEFAULT_TOAST_OPTIONS,
    ...toastOptions,
    classNames: {
      ...DEFAULT_TOAST_OPTIONS.classNames,
      ...toastOptions?.classNames,
    },
  }
}

/**
 * Shows a generic toast message.
 * @param message - Toast message content.
 * @param options - Optional toast configuration.
 * @returns The toast identifier.
 */
export function showToast(message: ToastMessage, options?: ToastOptions) {
  return toast(message, options)
}

/**
 * Shows a success toast message.
 * @param message - Toast message content.
 * @param options - Optional toast configuration.
 * @returns The toast identifier.
 */
export function showSuccess(message: ToastMessage, options?: ToastOptions) {
  return toast.success(message, options)
}

/**
 * Shows an informational toast message.
 * @param message - Toast message content.
 * @param options - Optional toast configuration.
 * @returns The toast identifier.
 */
export function showInfo(message: ToastMessage, options?: ToastOptions) {
  return toast.info(message, options)
}

/**
 * Shows a warning toast message.
 * @param message - Toast message content.
 * @param options - Optional toast configuration.
 * @returns The toast identifier.
 */
export function showWarning(message: ToastMessage, options?: ToastOptions) {
  return toast.warning(message, options)
}

/**
 * Shows an error toast message.
 * @param message - Toast message content.
 * @param options - Optional toast configuration.
 * @returns The toast identifier.
 */
export function showError(message: ToastMessage, options?: ToastOptions) {
  return toast.error(message, options)
}

/**
 * Shows a promise toast with loading, success, and error states.
 * @template Data - Promise result type.
 * @param promise - Promise or promise factory to track.
 * @param options - Promise toast configuration.
 * @returns The promise toast identifier.
 */
export function showPromise<Data>(
  promise: Promise<Data> | (() => Promise<Data>),
  options: ToastPromiseOptions<Data>,
) {
  return toast.promise(promise, options)
}
