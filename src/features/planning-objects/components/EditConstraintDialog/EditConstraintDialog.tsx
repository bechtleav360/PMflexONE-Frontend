import { useState } from 'react'

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

import { useUpdateConstraint } from '../../hooks/useUpdateConstraint'
import { useEditConstraintDialogStore } from '../../store/useEditConstraintDialogStore'
import type { ConstraintListItem } from '../../types/constraint.types'
import type { ConstraintFormValues } from '../../utils/constraintSchema'
import { ConfirmDiscardDialog } from '../ConfirmDiscardDialog'
import { EditConstraintForm } from './EditConstraintForm'

/** Props for {@link EditConstraintDialog}. */
interface EditConstraintDialogProps {
  /** ID of the project scope. */
  scopeId: string
  /** All constraints in the current scope — used to look up the active item by ID. */
  constraints: ConstraintListItem[]
}

/**
 * Dialog that wraps the constraint edit form.
 * Open/close state and the selected constraint ID are managed by the edit-constraint dialog store.
 *
 * @param props - Component props.
 * @param props.scopeId - The ID of the project.
 * @param props.constraints - Flat list of constraints; the active one is found by `constraintId`.
 * @returns The rendered dialog with the edit form inside.
 */
export function EditConstraintDialog({ scopeId, constraints }: EditConstraintDialogProps) {
  const { t } = useTranslation()
  const { isOpen, constraintId, mode, close } = useEditConstraintDialogStore()
  const readOnly = mode === 'view'
  const { mutateAsync, isPending } = useUpdateConstraint('Project', scopeId)

  const constraint = constraints.find((c) => c.id === constraintId) ?? null

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

  async function handleSubmit(values: ConstraintFormValues) {
    if (!constraintId || !constraint) return
    try {
      await mutateAsync({
        id: constraintId,
        input: { version: constraint.version, ...values },
      })
      showSuccess(t('features.planningObjects.constraints.toast.updateSuccess'))
    } catch (error) {
      showError(
        getGraphQLErrorMessage(error, t('features.planningObjects.constraints.toast.updateError')),
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
                ? t('features.planningObjects.constraints.viewTitle')
                : t('features.planningObjects.constraints.title')}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {!constraint && (
              <p
                className="text-destructive py-8 text-center text-sm"
                role="alert"
              >
                {t('features.planningObjects.constraints.loadError')}
              </p>
            )}
            {constraint && (
              <EditConstraintForm
                constraint={constraint}
                scopeId={scopeId}
                onSubmit={handleSubmit}
                onSuccess={close}
                readOnly={readOnly}
                onDirtyChange={readOnly ? undefined : setFormIsDirty}
              />
            )}
          </DialogBody>
          {!readOnly && constraint && (
            <DialogFooter>
              <Button
                type="submit"
                form="edit-constraint-form"
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
