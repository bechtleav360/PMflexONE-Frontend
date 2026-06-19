import { useRef } from 'react'

import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'
import { showSuccess } from '@/shared/components/Toast/toastApi'

import { useSupportServicesUiStore } from '../../store/supportServicesUiStore'
import { SupportServiceForm, type SupportServiceFormHandle } from '../SupportServiceForm'

interface SupportServiceFormDialogProps {
  /** Project ID for scoping queries and mutations. */
  projectId: string
}

/**
 * Modal dialog wrapper for the support service create/edit form.
 *
 * Reads open state, supportServiceId and defaultParentId from the
 * `useSupportServicesUiStore`. Opens in create mode when `supportServiceId`
 * is null, and in edit mode when it is set.
 *
 * @param props - Component props.
 * @param props.projectId - Project ID forwarded to the inner form.
 * @returns The rendered dialog with the support service form inside.
 */
export function SupportServiceFormDialog({ projectId }: SupportServiceFormDialogProps) {
  const { t } = useTranslation()
  const formDialog = useSupportServicesUiStore((s) => s.formDialog)
  const closeFormDialog = useSupportServicesUiStore((s) => s.closeFormDialog)
  const formRef = useRef<SupportServiceFormHandle>(null)

  const isEdit = Boolean(formDialog.supportServiceId)
  const title = isEdit
    ? t('features.supportServicesManagement.form.editTitle')
    : t('features.supportServicesManagement.form.createTitle')

  function handleSaved() {
    showSuccess(
      isEdit
        ? t('features.supportServicesManagement.toast.saved')
        : t('features.supportServicesManagement.toast.created'),
    )
    closeFormDialog()
  }

  return (
    <Dialog
      open={formDialog.open}
      onOpenChange={(open) => {
        if (!open) formRef.current?.requestClose()
      }}
    >
      <DialogContent
        size="lg"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
          formRef.current?.requestClose()
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <SupportServiceForm
          ref={formRef}
          projectId={projectId}
          supportServiceId={formDialog.supportServiceId ?? undefined}
          defaultParentId={formDialog.defaultParentId}
          onSaved={handleSaved}
          onCancel={closeFormDialog}
        />
      </DialogContent>
    </Dialog>
  )
}
