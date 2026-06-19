import { useTranslation } from 'react-i18next'

import {
  Button,
  showError,
  showInfo,
  showPromise,
  showSuccess,
  showWarning,
} from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for toast notification variants.
 * @returns A section with buttons that trigger each toast type.
 */
export function ToastSection() {
  const { t } = useTranslation()

  const triggerPromiseToast = () => {
    return showPromise(
      new Promise<void>((resolve) => {
        window.setTimeout(() => {
          resolve()
        }, 1500)
      }),
      {
        loading: t('showcase.toast.promiseLoading'),
        success: () => t('showcase.toast.promiseSuccess'),
        error: () => t('showcase.toast.promiseError'),
      },
    )
  }

  return (
    <ShowcaseSection title={t('showcase.toast.title')}>
      <div className="space-y-sm max-w-md">
        <p className="text-muted-foreground text-sm">{t('showcase.toast.description')}</p>
        <p className="text-muted-foreground text-sm">{t('showcase.toast.hint')}</p>
      </div>
      <div className="gap-md flex flex-wrap">
        <Button
          variant="default"
          onClick={() => {
            showSuccess(t('showcase.toast.successPreviewTitle'), {
              description: t('showcase.toast.success'),
            })
          }}
        >
          {t('showcase.toast.successButton')}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            showInfo(t('showcase.toast.infoPreviewTitle'), {
              description: t('showcase.toast.info'),
            })
          }}
        >
          {t('showcase.toast.infoButton')}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            showWarning(t('showcase.toast.warningPreviewTitle'), {
              description: t('showcase.toast.warning'),
            })
          }}
        >
          {t('showcase.toast.warningButton')}
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            showError(t('showcase.toast.errorPreviewTitle'), {
              description: t('showcase.toast.error'),
            })
          }}
        >
          {t('showcase.toast.errorButton')}
        </Button>
        <Button
          variant="outline"
          onClick={triggerPromiseToast}
        >
          {t('showcase.toast.promiseButton')}
        </Button>
      </div>
    </ShowcaseSection>
  )
}
