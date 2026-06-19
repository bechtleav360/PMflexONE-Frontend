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

import { useGoal } from '../../hooks/useGoal'
import { useUpdateGoal } from '../../hooks/useUpdateGoal'
import { useEditGoalDialogStore } from '../../store/useEditGoalDialogStore'
import type { PlanningObjectScopeType } from '../../types/shared.types'
import type { GoalFormValues } from '../../utils/goalSchema'
import { ConfirmDiscardDialog } from '../ConfirmDiscardDialog'
import { EditGoalForm } from './EditGoalForm'

/** Props for {@link EditGoalDialog}. */
interface EditGoalDialogProps {
  /** Scope context for the goal. */
  scopeType: PlanningObjectScopeType
  /** ID of the scoped entity. */
  scopeId: string
  /** ID of the parent program for the "Applies to" combobox. Pass `null` when there is none. */
  programId?: string | null
  /** ID of the parent portfolio for the "Applies to" combobox. Pass `null` when there is none. */
  portfolioId?: string | null
  /**
   * Whether to render the "Applies to" section.
   * Typically `true` for project-scoped goals.
   */
  showAppliesTo?: boolean
}

/**
 * Dialog that wraps the goal edit form.
 * Open/close state and the selected goal ID are managed by the edit-goal dialog store.
 * Shows a loading spinner while the goal detail is fetched.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @param props.programId - Parent program ID for the "Applies to" combobox.
 * @param props.portfolioId - Parent portfolio ID for the "Applies to" combobox.
 * @param props.showAppliesTo - Whether to render the "Applies to" section.
 * @returns The rendered dialog with the edit form inside.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- dialog component; branches for view/edit/loading states inflate apparent complexity
export function EditGoalDialog({
  scopeType,
  scopeId,
  programId = null,
  portfolioId = null,
  showAppliesTo = false,
}: EditGoalDialogProps) {
  const { t } = useTranslation()
  const { isOpen, goalId, mode, close } = useEditGoalDialogStore()
  const readOnly = mode === 'view'
  const { data: goalDetail, isLoading, isError } = useGoal(goalId ?? '')
  const { mutateAsync, isPending } = useUpdateGoal(scopeType, scopeId)

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

  async function handleSubmit(values: GoalFormValues) {
    if (!goalId || !goalDetail) return
    try {
      const result = await mutateAsync({
        id: goalId,
        input: { version: goalDetail.version, ...values },
      })
      showSuccess(t('features.planningObjects.goals.toast.updateSuccess'))
      return result
    } catch (error) {
      showError(
        getGraphQLErrorMessage(error, t('features.planningObjects.goals.toast.updateError')),
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
                ? t('features.planningObjects.goals.viewTitle')
                : t('features.planningObjects.goals.title')}
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
            {!isLoading && (isError || (!goalDetail && !isLoading)) && (
              <p
                className="text-destructive py-4 text-sm"
                role="alert"
              >
                {t('features.planningObjects.goals.loadError')}
              </p>
            )}
            {!isLoading && !isError && goalDetail && (
              <EditGoalForm
                goalDetail={goalDetail}
                onSubmit={handleSubmit}
                onSuccess={close}
                readOnly={readOnly}
                scopeType={scopeType}
                scopeId={scopeId}
                programId={programId}
                portfolioId={portfolioId}
                showAppliesTo={showAppliesTo}
                onDirtyChange={readOnly ? undefined : setFormIsDirty}
              />
            )}
          </DialogBody>
          {!readOnly && !isLoading && goalDetail && (
            <DialogFooter>
              <Button
                type="submit"
                form="edit-goal-form"
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
