import { useRef } from 'react'

import { useTranslation } from 'react-i18next'

import { ProjectInitiationRequestStatusBadge } from '@/features/project-initiation-requests'
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

import { useProgramInitiationRequestDialog } from '../hooks/useProgramInitiationRequestDialog'
import type { ProgramInitiationRequestFormHandle } from './ProgramInitiationRequestForm'
import { ProgramInitiationRequestForm } from './ProgramInitiationRequestForm'

const FORM_ID = 'program-detail-ppir-form'

interface ProgramInitiationRequestDialogProps {
  programId: string
  portfolioId: string
  programName: string
  isOpen: boolean
  onClose: () => void
}

/**
 * Combined create / view / edit dialog for a program's initiation request.
 * Opened from the Program Detail page.
 *
 * @param props - Component props.
 * @param props.programId - The program to scope the PIR lookup and creation to.
 * @param props.portfolioId - The portfolio ID required by the create mutation.
 * @param props.programName - Display name shown in the read-only requesting-program field.
 * @param props.isOpen - Whether the dialog is visible.
 * @param props.onClose - Callback to close the dialog.
 * @returns The dialog element.
 */
// eslint-disable-next-line max-lines-per-function -- dialog component; three action modes (create/edit/view) and conditional footer drive the count
export function ProgramInitiationRequestDialog({
  programId,
  portfolioId,
  programName,
  isOpen,
  onClose,
}: ProgramInitiationRequestDialogProps) {
  const { t } = useTranslation()
  const formRef = useRef<ProgramInitiationRequestFormHandle>(null)

  const {
    isLoading,
    isMutating,
    mode,
    dialogTitle,
    pirStatus,
    portfolioName,
    defaultValues,
    onFormSubmit,
    onFormSaveDraft,
  } = useProgramInitiationRequestDialog(programId, portfolioId, onClose)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        size="xl"
        className="max-h-[90vh]"
        aria-describedby={undefined}
      >
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2">
            <DialogTitle>{dialogTitle}</DialogTitle>
            {pirStatus && <ProjectInitiationRequestStatusBadge status={pirStatus} />}
          </div>
          {mode === 'create' && (
            <DialogDescription>
              {t('pages.programInitiationRequests.dialog.createDescription')}
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
            <ProgramInitiationRequestForm
              ref={mode !== 'view' ? formRef : undefined}
              formId={FORM_ID}
              mode={mode}
              defaultValues={defaultValues}
              onSubmit={onFormSubmit}
              onSaveDraft={onFormSaveDraft}
              isPending={isMutating}
              hideActions
              programName={programName}
              portfolioName={portfolioName}
            />
          )}
        </DialogBody>

        {!isLoading && (
          <DialogFooter>
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
