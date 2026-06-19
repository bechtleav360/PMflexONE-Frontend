import { useState } from 'react'

import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

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

import { useAssumption } from '../../hooks/useAssumption'
import { useUpdateAssumption } from '../../hooks/useUpdateAssumption'
import { useEditAssumptionDialogStore } from '../../store/useEditAssumptionDialogStore'
import type { AssumptionFormValues } from '../../utils/assumptionSchema'
import { ConfirmDiscardDialog } from '../ConfirmDiscardDialog'
import { EditAssumptionForm } from './EditAssumptionForm'

/** Props for {@link EditAssumptionDialog}. */
interface EditAssumptionDialogProps {
  /** ID of the scoped project entity. */
  scopeId: string
  /** Called with the risk entry ID when the user navigates to an existing linked risk. */
  onOpenRiskEntry?: (id: string) => void
}

/**
 * Dialog that wraps the assumption edit form.
 * Open/close state and the selected assumption ID are managed by {@link useEditAssumptionDialogStore}.
 * Shows a loading spinner while the assumption detail is fetched.
 *
 * @param props - Component props.
 * @param props.scopeId - The ID of the scoped project entity.
 * @returns The rendered dialog with the edit form inside.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- dialog component; branches for view/edit/loading states inflate apparent complexity
export function EditAssumptionDialog({ scopeId, onOpenRiskEntry }: EditAssumptionDialogProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isOpen, assumptionId, mode, close } = useEditAssumptionDialogStore()
  const readOnly = mode === 'view'
  const { data: assumption, isLoading } = useAssumption(assumptionId ?? '')
  const { mutateAsync, isPending } = useUpdateAssumption('Project', scopeId)

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

  function handleNavigateToRisk(riskId: string) {
    onOpenRiskEntry?.(riskId)
    close()
    void navigate(`/projects/${scopeId}/risk-management`)
  }

  async function handleSubmit(values: AssumptionFormValues) {
    if (!assumptionId || !assumption) return
    const wasRisk = assumption.isRisk
    try {
      await mutateAsync({
        id: assumptionId,
        wasRisk: assumption.isRisk,
        input: { version: assumption.version, ...values },
      })
      if (!wasRisk && values.isRisk) {
        // FR-012: risk created → hook navigates to risk management + opens edit dialog
        showSuccess(t('features.planningObjects.assumptions.toast.riskCreated'))
        close()
      } else if (wasRisk && !values.isRisk) {
        showSuccess(t('features.planningObjects.assumptions.toast.updateSuccess'))
        close()
      } else {
        showSuccess(t('features.planningObjects.assumptions.toast.updateSuccess'))
        close()
      }
    } catch (error) {
      showError(
        getGraphQLErrorMessage(error, t('features.planningObjects.assumptions.toast.updateError')),
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
                ? t('features.planningObjects.assumptions.viewTitle')
                : t('features.planningObjects.assumptions.title')}
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
            {!isLoading && !assumption && (
              <p
                className="text-destructive py-8 text-center text-sm"
                role="alert"
              >
                {t('features.planningObjects.assumptions.loadError')}
              </p>
            )}
            {!isLoading && assumption && (
              <EditAssumptionForm
                assumption={assumption}
                scopeId={scopeId}
                onSubmit={handleSubmit}
                onNavigateToRisk={handleNavigateToRisk}
                readOnly={readOnly}
                onDirtyChange={readOnly ? undefined : setFormIsDirty}
              />
            )}
          </DialogBody>
          {!readOnly && !isLoading && assumption && (
            <DialogFooter>
              <Button
                type="submit"
                form="edit-assumption-form"
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
