import { useRef } from 'react'

import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from '@/shared/components'

import { useProjectInitiationRequestDialog } from '../hooks/useProjectInitiationRequestDialog'
import type { ProjectInitiationRequestFormHandle } from './ProjectInitiationRequestForm'
import { ProjectInitiationRequestForm } from './ProjectInitiationRequestForm'
import { ProjectInitiationRequestStatusBadge } from './ProjectInitiationRequestStatusBadge'

const FORM_ID = 'project-detail-pir-form'

interface ProjectInitiationRequestDialogProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

/**
 * Combined create / view / edit dialog for a project's initiation request.
 * Opened from the Project Detail page.
 *
 * - No PIR exists             → create form with the project pre-selected.
 * - PIR is draft              → edit form with Save as Draft + Submit actions.
 * - PIR submitted / accepted  → read-only view form with a Close button.
 *
 * @param props - Component props.
 * @param props.projectId - The project to scope the PIR lookup and creation to.
 * @param props.isOpen    - Whether the dialog is visible.
 * @param props.onClose   - Callback to close the dialog.
 * @returns The dialog element.
 */
// eslint-disable-next-line max-lines-per-function -- dialog component; three action modes (create/edit/view) and conditional footer drive the count
export function ProjectInitiationRequestDialog({
  projectId,
  isOpen,
  onClose,
}: ProjectInitiationRequestDialogProps) {
  const { t } = useTranslation()
  const formRef = useRef<ProjectInitiationRequestFormHandle>(null)

  const {
    isLoading,
    isMutating,
    mode,
    dialogTitle,
    pirStatus,
    defaultValues,
    onFormSubmit,
    onFormSaveDraft,
  } = useProjectInitiationRequestDialog(projectId, onClose)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        size="xl"
        className="flex max-h-[90vh] flex-col overflow-hidden"
        aria-describedby={undefined}
      >
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2">
            <DialogTitle>{dialogTitle}</DialogTitle>
            {pirStatus && <ProjectInitiationRequestStatusBadge status={pirStatus} />}
          </div>
          {mode === 'create' && (
            <DialogDescription>
              {t('pages.initiationRequests.dialog.createDescription')}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogBody>
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <ProjectInitiationRequestForm
              ref={mode !== 'view' ? formRef : undefined}
              formId={FORM_ID}
              mode={mode}
              defaultValues={defaultValues}
              onSubmit={onFormSubmit}
              onSaveDraft={onFormSaveDraft}
              isPending={isMutating}
              hideActions
              projectLocked
            />
          )}
        </DialogBody>

        {!isLoading && (
          <DialogFooter className="shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={isMutating}
              onClick={onClose}
            >
              {t('pages.initiationRequests.form.cancelButton')}
            </Button>
            {mode !== 'view' && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isMutating}
                  onClick={() => formRef.current?.saveDraft()}
                >
                  {t('pages.initiationRequests.form.saveDraftButton')}
                </Button>
                <Button
                  type="submit"
                  form={FORM_ID}
                  disabled={isMutating}
                >
                  {t('pages.initiationRequests.form.submitButton')}
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
