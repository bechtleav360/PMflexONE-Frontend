import { useRef } from 'react'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from '@/shared/components'

import { useProjectCharterDialogActions } from '../hooks/useProjectCharterDialogActions'
import { useProjectCharterDialogData } from '../hooks/useProjectCharterDialogData'
import { charterToFormValues } from '../utils/projectCharterMappers'
import { ProjectCharterDialogFooter } from './ProjectCharterDialogFooter'
import type { ProjectCharterFormHandle } from './ProjectCharterForm'
import { ProjectCharterForm } from './ProjectCharterForm'
import { ProjectCharterStatusBadge } from './ProjectCharterStatusBadge'

interface ProjectCharterDialogProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

const FORM_ID = 'project-charter-dialog-form'

/**
 * Combined create / edit dialog for a project's Project Charter.
 * Opened from the Project Detail page.
 *
 * - No charter exists    → create form with Save as Draft + Submit actions.
 * - Charter is DRAFT     → edit form with Save as Draft + Submit actions.
 * - Charter is SUBMITTED → edit form with Save as Draft + Submit actions.
 * - Charter is ACCEPTED  → edit form with Save as Draft only (Submit hidden).
 *
 * @param props - Component props.
 * @param props.projectId - The project to scope the charter lookup and creation to.
 * @param props.isOpen    - Whether the dialog is visible.
 * @param props.onClose   - Callback to close the dialog.
 * @returns The project charter dialog.
 */
export function ProjectCharterDialog({ projectId, isOpen, onClose }: ProjectCharterDialogProps) {
  const formRef = useRef<ProjectCharterFormHandle>(null)
  const { charterSummary, charter, isLoading, hasExisting, isAccepted, dialogTitle } =
    useProjectCharterDialogData(projectId)
  const { handleSave, handleSubmit, isSavePending, isSubmitPending } =
    useProjectCharterDialogActions(projectId, charterSummary, charter, onClose)

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
            {charter?.status && <ProjectCharterStatusBadge status={charter.status} />}
          </div>
        </DialogHeader>

        <DialogBody>
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <ProjectCharterForm
              ref={formRef}
              formId={FORM_ID}
              hideActions
              mode={hasExisting ? 'edit' : 'create'}
              defaultValues={charter ? charterToFormValues(charter) : undefined}
              onSave={handleSave}
              onSubmit={isAccepted ? undefined : handleSubmit}
              isSavePending={isSavePending}
              isSubmitPending={isSubmitPending}
            />
          )}
        </DialogBody>

        {!isLoading && (
          <ProjectCharterDialogFooter
            formId={FORM_ID}
            isAccepted={isAccepted}
            isSavePending={isSavePending}
            isSubmitPending={isSubmitPending}
            onClose={onClose}
            onSubmit={() => formRef.current?.triggerSubmit()}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
