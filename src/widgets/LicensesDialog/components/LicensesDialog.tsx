import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from '@/shared/components'
import { useLicensesDialogStore } from '@/shared/lib/useLicensesDialogStore'

import { useLicensesQuery } from '../api/useLicensesQuery'
import { LicensesPackageList } from './LicensesPackageList'

/**
 * Dialog displaying all bundled third-party open-source licences.
 * Open state is controlled via {@link useLicensesDialogStore}.
 * @returns The dialog element.
 */
export function LicensesDialog() {
  const open = useLicensesDialogStore((s) => s.open)
  const setOpen = useLicensesDialogStore((s) => s.setOpen)
  const { t } = useTranslation()

  const { data, isLoading, isError } = useLicensesQuery(open)

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent className="h-[85vh] max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t('licenses.dialogTitle')}</DialogTitle>
          <DialogDescription>{t('licenses.dialogDescription')}</DialogDescription>
        </DialogHeader>

        <DialogBody className="gap-md flex flex-col overflow-hidden">
          {isLoading && (
            <div className="gap-md flex flex-col">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="gap-lg flex items-center justify-between"
                >
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <p
              role="alert"
              className="text-destructive text-sm"
            >
              {t('licenses.loadError')}
            </p>
          )}

          {data && <LicensesPackageList sources={data.sources} />}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
