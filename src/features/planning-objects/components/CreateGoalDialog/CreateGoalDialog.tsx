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

import { useCreateGoal } from '../../hooks/useCreateGoal'
import { useSetGoalParent } from '../../hooks/useSetGoalParent'
import { useCreateGoalDialogStore } from '../../store/useCreateGoalDialogStore'
import type { PlanningObjectScopeType } from '../../types/shared.types'
import type { GoalFormValues } from '../../utils/goalSchema'
import { CreateGoalForm } from './CreateGoalForm'

/** Props for {@link CreateGoalDialog}. */
interface CreateGoalDialogProps {
  /** Scope context for the goal. */
  scopeType: PlanningObjectScopeType
  /** ID of the scoped entity. */
  scopeId: string
}

/**
 * Dialog that wraps the goal creation form.
 * Open/close state is managed by the create-goal dialog store.
 * When `parentId` is set in the store, the newly created goal is automatically
 * linked to that parent via `setGoalParent` after creation.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered dialog with the creation form inside.
 */
export function CreateGoalDialog({ scopeType, scopeId }: CreateGoalDialogProps) {
  const { t } = useTranslation()
  const { isOpen, parentId, close } = useCreateGoalDialogStore()
  const { mutateAsync: createGoal, isPending } = useCreateGoal(scopeType, scopeId)
  const { mutateAsync: setGoalParent, isPending: isParentPending } = useSetGoalParent(
    scopeType,
    scopeId,
  )

  async function handleSubmit(values: GoalFormValues) {
    try {
      const newGoal = await createGoal(values)
      if (parentId) {
        await setGoalParent({ id: newGoal.id, version: newGoal.version, parentId })
      }
      close()
      showSuccess(t('features.planningObjects.goals.toast.createSuccess'))
    } catch (error) {
      showError(
        getGraphQLErrorMessage(error, t('features.planningObjects.goals.toast.createError')),
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
          <DialogTitle>{t('features.planningObjects.goals.addGoal')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <CreateGoalForm onSubmit={handleSubmit} />
        </DialogBody>
        <DialogFooter>
          <Button
            type="submit"
            form="create-goal-form"
            disabled={isPending || isParentPending}
          >
            {t('features.planningObjects.common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
