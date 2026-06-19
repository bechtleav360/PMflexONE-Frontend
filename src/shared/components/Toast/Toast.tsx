import { Toaster, type ToasterProps } from 'sonner'

import { mergeToastOptions } from './toastApi'

type ToastProviderProps = ToasterProps

/**
 * Mounts the Sonner toaster with the shared P1NG defaults.
 * @param props - Sonner toaster props.
 * @param props.position - Toast placement, defaulting to the top right.
 * @param props.richColors - Whether to use Sonner's rich color defaults.
 * @param props.closeButton - Whether to render a close button.
 * @param props.toastOptions - Shared toast class name overrides.
 * @returns The configured toaster instance.
 */
export function ToastProvider({
  position = 'top-right',
  richColors = false,
  closeButton = true,
  toastOptions,
  ...props
}: ToastProviderProps) {
  return (
    <Toaster
      position={position}
      richColors={richColors}
      closeButton={closeButton}
      toastOptions={mergeToastOptions(toastOptions)}
      {...props}
    />
  )
}
