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

import { useCreateAssumption } from '../../hooks/useCreateAssumption'
import { useCreateAssumptionDialogStore } from '../../store/useCreateAssumptionDialogStore'
import type { AssumptionFormValues } from '../../utils/assumptionSchema'
import { CreateAssumptionForm } from './CreateAssumptionForm'

/** Props for {@link CreateAssumptionDialog}. */
interface CreateAssumptionDialogProps {
  /** ID of the scoped project entity. */
  scopeId: string
}

/**
 * Dialog that wraps the assumption creation form.
 * Open/close state is managed by {@link useCreateAssumptionDialogStore}.
 *
 * @param props - Component props.
 * @param props.scopeId - The ID of the scoped project entity.
 * @returns The rendered dialog with the creation form inside.
 */
export function CreateAssumptionDialog({ scopeId }: CreateAssumptionDialogProps) {
  const { t } = useTranslation()
  const { isOpen, close } = useCreateAssumptionDialogStore()
  const { mutateAsync, isPending } = useCreateAssumption('Project', scopeId)

  async function handleSubmit(values: AssumptionFormValues) {
    try {
      await mutateAsync(values)
      close()
      showSuccess(t('features.planningObjects.assumptions.toast.createSuccess'))
    } catch (error) {
      showError(
        getGraphQLErrorMessage(error, t('features.planningObjects.assumptions.toast.createError')),
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
          <DialogTitle>{t('features.planningObjects.assumptions.addAssumption')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <CreateAssumptionForm onSubmit={handleSubmit} />
        </DialogBody>
        <DialogFooter>
          <Button
            type="submit"
            form="create-assumption-form"
            disabled={isPending}
          >
            {t('features.planningObjects.common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
