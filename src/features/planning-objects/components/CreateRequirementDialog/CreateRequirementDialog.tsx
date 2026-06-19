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

import { useCreateRequirement } from '../../hooks/useCreateRequirement'
import { useSetRequirementParent } from '../../hooks/useSetRequirementParent'
import { useCreateRequirementDialogStore } from '../../store/useCreateRequirementDialogStore'
import type { PlanningObjectScopeType } from '../../types/shared.types'
import type { RequirementFormValues } from '../../utils/requirementSchema'
import { CreateRequirementForm } from './CreateRequirementForm'

/** Props for {@link CreateRequirementDialog}. */
interface CreateRequirementDialogProps {
  /** Scope context for the requirement. */
  scopeType: PlanningObjectScopeType
  /** ID of the scoped entity. */
  scopeId: string
}

/**
 * Dialog that wraps the requirement creation form.
 * Open/close state is managed by the create-requirement dialog store.
 * When `parentId` is set in the store, the newly created requirement is
 * automatically linked to that parent via `setRequirementParent` after creation.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered dialog with the creation form inside.
 */
export function CreateRequirementDialog({ scopeType, scopeId }: CreateRequirementDialogProps) {
  const { t } = useTranslation()
  const { isOpen, parentId, close } = useCreateRequirementDialogStore()
  const { mutateAsync: createRequirement, isPending } = useCreateRequirement(scopeType, scopeId)
  const { mutateAsync: setRequirementParent, isPending: isParentPending } = useSetRequirementParent(
    scopeType,
    scopeId,
  )

  async function handleSubmit(values: RequirementFormValues) {
    try {
      const newReq = await createRequirement(values)
      if (parentId) {
        await setRequirementParent({ id: newReq.id, version: newReq.version, parentId })
      }
      close()
      showSuccess(t('features.planningObjects.requirements.toast.createSuccess'))
    } catch (error) {
      showError(
        getGraphQLErrorMessage(error, t('features.planningObjects.requirements.toast.createError')),
      )
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{t('features.planningObjects.requirements.addRequirement')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <CreateRequirementForm onSubmit={handleSubmit} />
        </DialogBody>
        <DialogFooter>
          <Button
            type="submit"
            form="create-requirement-form"
            disabled={isPending || isParentPending}
          >
            {t('features.planningObjects.common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
