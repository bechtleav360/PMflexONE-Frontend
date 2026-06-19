import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useSupportServicesUiStore } from '../../store/supportServicesUiStore'

/**
 * One-time confirmation dialog shown when "Untergeordnete Supportleistung anlegen"
 * is triggered on a leaf node that has `estimatedEffort > 0`.
 *
 * Warns the user that the manual effort value will be lost when creating a child.
 * On "Weiter": closes the dialog and opens the form dialog with parentId pre-filled.
 * On "Abbrechen": closes the dialog without opening the form.
 *
 * @returns The rendered warning dialog.
 */
export function FirstChildWarningDialog() {
  const { t } = useTranslation()

  const firstChildWarning = useSupportServicesUiStore((s) => s.firstChildWarning)
  const closeFirstChildWarning = useSupportServicesUiStore((s) => s.closeFirstChildWarning)
  const openFormDialog = useSupportServicesUiStore((s) => s.openFormDialog)

  const { open, nodeId, effort } = firstChildWarning

  function handleContinue() {
    closeFirstChildWarning()
    if (nodeId) {
      openFormDialog(undefined, nodeId)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeFirstChildWarning()
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>
            {t('features.supportServicesManagement.firstChildWarning.title')}
          </DialogTitle>
          <DialogDescription>
            {t('features.supportServicesManagement.firstChildWarning.description', { effort })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={closeFirstChildWarning}
          >
            {t('features.supportServicesManagement.firstChildWarning.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
          >
            {t('features.supportServicesManagement.firstChildWarning.continue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
