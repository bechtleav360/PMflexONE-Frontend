import { useState } from 'react'

import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  showError,
  showSuccess,
} from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { useRequirement } from '../../hooks/useRequirement'
import { useUpdateRequirement } from '../../hooks/useUpdateRequirement'
import { useEditRequirementDialogStore } from '../../store/useEditRequirementDialogStore'
import type { RequirementFormValues } from '../../utils/requirementSchema'
import { ConfirmDiscardDialog } from '../ConfirmDiscardDialog'
import { EditRequirementForm } from './EditRequirementForm'

/** Props for {@link EditRequirementDialog}. */
interface EditRequirementDialogProps {
  /** ID of the scoped entity. */
  scopeId: string
}

/**
 * Dialog that wraps the requirement edit form.
 * Open/close state and the selected requirement ID are managed by the edit-requirement dialog store.
 * Shows a loading spinner while the requirement detail is fetched.
 *
 * @param props - Component props.
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered dialog with the edit form inside.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- dialog component; branches for view/edit/loading states inflate apparent complexity
export function EditRequirementDialog({ scopeId }: EditRequirementDialogProps) {
  const { t } = useTranslation()
  const { isOpen, requirementId, mode, close } = useEditRequirementDialogStore()
  const readOnly = mode === 'view'
  const { data: requirementDetail, isLoading } = useRequirement(requirementId ?? '')
  const { mutateAsync, isPending } = useUpdateRequirement('Project', scopeId)

  const [formIsDirty, setFormIsDirty] = useState(false)
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false)

  function handleOpenChange(open: boolean) {
    if (!open) {
      if (!readOnly && formIsDirty) {
        setConfirmDiscardOpen(true)
      } else {
        close()
      }
    }
  }

  async function handleSubmit(values: RequirementFormValues) {
    if (!requirementId || !requirementDetail) return
    try {
      const result = await mutateAsync({
        id: requirementId,
        input: { version: requirementDetail.version, ...values },
      })
      showSuccess(t('features.planningObjects.requirements.toast.updateSuccess'))
      return result
    } catch (error) {
      showError(
        getGraphQLErrorMessage(error, t('features.planningObjects.requirements.toast.updateError')),
      )
    }
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>
              {readOnly
                ? t('features.planningObjects.requirements.viewTitle')
                : t('features.planningObjects.requirements.title')}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2
                  className="text-muted-foreground h-6 w-6 animate-spin"
                  aria-hidden="true"
                />
              </div>
            )}
            {!isLoading && !requirementDetail && (
              <p
                className="text-destructive py-8 text-center text-sm"
                role="alert"
              >
                {t('features.planningObjects.requirements.loadError')}
              </p>
            )}
            {!isLoading && requirementDetail && (
              <EditRequirementForm
                requirementDetail={requirementDetail}
                onSubmit={handleSubmit}
                onSuccess={close}
                readOnly={readOnly}
                scopeId={scopeId}
                onDirtyChange={readOnly ? undefined : setFormIsDirty}
              />
            )}
          </DialogBody>
          {!readOnly && !isLoading && requirementDetail && (
            <DialogFooter>
              <Button
                type="submit"
                form="edit-requirement-form"
                disabled={isPending}
              >
                {t('features.planningObjects.common.save')}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDiscardDialog
        open={confirmDiscardOpen}
        onConfirm={() => {
          setFormIsDirty(false)
          setConfirmDiscardOpen(false)
          close()
        }}
        onCancel={() => setConfirmDiscardOpen(false)}
      />
    </>
  )
}
