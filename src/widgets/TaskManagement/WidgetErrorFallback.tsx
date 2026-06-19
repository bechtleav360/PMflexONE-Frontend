import { useTranslation } from 'react-i18next'

interface WidgetErrorFallbackProps {
  onReset: () => void
}

/**
 * Inline fallback shown when a widget section fails to render.
 * @param root0 - Component props.
 * @param root0.onReset - Callback to reset the error boundary state.
 * @returns A compact error message with a retry button.
 */
export function WidgetErrorFallback({ onReset }: WidgetErrorFallbackProps) {
  const { t } = useTranslation()

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="text-muted-foreground flex flex-col items-center justify-center gap-2 p-4 text-sm"
    >
      <p>
        {t('widgets.taskManagement.sectionError', 'Something went wrong loading this section.')}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-primary underline underline-offset-2"
      >
        {t('widgets.taskManagement.retry', 'Retry')}
      </button>
    </div>
  )
}
