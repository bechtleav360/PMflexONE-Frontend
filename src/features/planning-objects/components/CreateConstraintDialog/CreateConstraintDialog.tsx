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

import { useCreateConstraint } from '../../hooks/useCreateConstraint'
import { useCreateConstraintDialogStore } from '../../store/useCreateConstraintDialogStore'
import type { ConstraintFormValues } from '../../utils/constraintSchema'
import { CreateConstraintForm } from './CreateConstraintForm'

/** Props for {@link CreateConstraintDialog}. */
interface CreateConstraintDialogProps {
  /** ID of the project scope. */
  scopeId: string
}

/**
 * Dialog that wraps the constraint creation form.
 * Open/close state is managed by the create-constraint dialog store.
 *
 * @param props - Component props.
 * @param props.scopeId - The ID of the project.
 * @returns The rendered dialog with the creation form inside.
 */
export function CreateConstraintDialog({ scopeId }: CreateConstraintDialogProps) {
  const { t } = useTranslation()
  const { isOpen, close } = useCreateConstraintDialogStore()
  const { mutateAsync, isPending } = useCreateConstraint('Project', scopeId)

  async function handleSubmit(values: ConstraintFormValues) {
    try {
      await mutateAsync(values)
      close()
      showSuccess(t('features.planningObjects.constraints.toast.createSuccess'))
    } catch (error) {
      showError(
        getGraphQLErrorMessage(error, t('features.planningObjects.constraints.toast.createError')),
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
          <DialogTitle>{t('features.planningObjects.constraints.addConstraint')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <CreateConstraintForm onSubmit={handleSubmit} />
        </DialogBody>
        <DialogFooter>
          <Button
            type="submit"
            form="create-constraint-form"
            disabled={isPending}
          >
            {t('features.planningObjects.common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
