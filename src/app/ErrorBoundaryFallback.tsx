import { useTranslation } from 'react-i18next'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components'

interface Props {
  onReload: () => void
}

/**
 * Fallback UI shown when a React render error is captured by the app boundary.
 * @param props - Component props.
 * @param props.onReload - Callback that reloads the application.
 * @returns A user-facing recovery screen.
 */
export function ErrorBoundaryFallback({ onReload }: Props) {
  const { t } = useTranslation()

  return (
    <div
      aria-atomic="true"
      aria-live="assertive"
      className="bg-background p-xl flex min-h-screen items-center justify-center"
      role="alert"
    >
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle>{t('errorBoundary.title')}</CardTitle>
            <CardDescription>{t('errorBoundary.description')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm leading-6">
            {t('errorBoundary.recoveryHint')}
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={onReload}>{t('errorBoundary.reload')}</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
