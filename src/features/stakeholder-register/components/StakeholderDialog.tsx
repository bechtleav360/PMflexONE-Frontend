import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useBlocker } from 'react-router-dom'

import type { StakeholderEntry, StrategyDescription } from '@/entities/stakeholder'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { useStakeholderDialogActions } from '../hooks/useStakeholderDialogActions'
import { useStakeholderDialogData } from '../hooks/useStakeholderDialogData'
import { useStakeholderDialogStore } from '../store/useStakeholderDialogStore'
import { StakeholderForm } from './StakeholderForm'

/** Props for {@link StakeholderDialog}. */
export interface StakeholderDialogProps {
  scopeType: ScopeType
  scopeId: string
  readOnly?: boolean
  strategyDescription?: StrategyDescription | null
  existingEntries?: StakeholderEntry[]
}

/**
 * Combined create/edit dialog for stakeholder entries.
 *
 * Reads the current payload from {@link useStakeholderDialogStore} to determine
 * whether to render in create or edit mode. Delegates save logic to
 * {@link useStakeholderDialogActions} and warns the user before discarding
 * unsaved changes via a React Router navigation blocker.
 *
 * @param props - Component props.
 * @param props.scopeType - The type of scope (Project, Program, Portfolio).
 * @param props.scopeId - The ID of the scope.
 * @param props.readOnly - When true, the form is displayed in read-only mode.
 * @param props.strategyDescription - The current strategy description for read-only display in the form.
 * @param props.existingEntries - All existing entries used for duplicate name detection.
 * @returns A dialog with the {@link StakeholderForm} and Save/Cancel actions.
 */
// eslint-disable-next-line max-lines-per-function -- dialog orchestration with form, navigation blocker, and unsaved-changes confirmation; logic is tightly coupled and cannot be split further
export function StakeholderDialog({
  scopeType,
  scopeId,
  readOnly = false,
  strategyDescription,
  existingEntries,
}: StakeholderDialogProps) {
  const { t } = useTranslation()
  const open = useStakeholderDialogStore((s) => s.open)
  const closeModal = useStakeholderDialogStore((s) => s.closeModal)
  const payload = useStakeholderDialogStore((s) => s.payload)

  const { defaultValues, dialogTitle } = useStakeholderDialogData()
  const { handleSave } = useStakeholderDialogActions({ scopeType, scopeId })

  const [formHasUnsavedChanges, setFormHasUnsavedChanges] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)

  const blocker = useBlocker(open && formHasUnsavedChanges)

  const discardWarningOpen = showDiscardWarning || blocker.state === 'blocked'

  function handleRequestClose() {
    if (formHasUnsavedChanges) {
      setShowDiscardWarning(true)
    } else {
      closeModal()
    }
  }

  function handleConfirmDiscard() {
    setShowDiscardWarning(false)
    if (blocker.state === 'blocked') {
      blocker.proceed()
    } else {
      closeModal()
    }
  }

  function handleCancelDiscard() {
    setShowDiscardWarning(false)
    if (blocker.state === 'blocked') blocker.reset()
  }

  const existingNames = existingEntries
    ?.filter((e) => !payload || e.id !== payload.id)
    .map((e) => e.name)

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleRequestClose()
        }}
      >
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
          <DialogHeader>
            <DialogTitle>
              {dialogTitle || t('pages.stakeholderRegister.form.createTitle')}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <StakeholderForm
              objectId={scopeId}
              defaultValues={defaultValues}
              onSave={handleSave}
              onCancel={handleRequestClose}
              readOnly={readOnly}
              strategyDescription={strategyDescription}
              initialResponsibleMember={payload?.responsible ?? null}
              existingNames={existingNames}
              onHasUnsavedChangesChange={setFormHasUnsavedChanges}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog
        open={discardWarningOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleCancelDiscard()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('pages.stakeholderRegister.form.unsavedChanges.discardTitle')}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm">
              {t('pages.stakeholderRegister.form.unsavedChanges.discardMessage')}
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDiscard}
            >
              {t('pages.stakeholderRegister.form.unsavedChanges.discardCancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDiscard}
            >
              {t('pages.stakeholderRegister.form.unsavedChanges.discardConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
