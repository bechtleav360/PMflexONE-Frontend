import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  showError,
  Skeleton,
} from '@/shared/components'

import { PROGRAM_QUERY_KEY } from '../api/programsApi'
import { useProgram } from '../hooks/useProgram'
import { useEditProgramDialogStore } from '../store/useEditProgramDialogStore'
import { EditProgramForm } from './EditProgramForm'

/**
 * Modal dialog that fetches the full program detail and renders {@link EditProgramForm}.
 *
 * Opens and closes via {@link useEditProgramDialogStore}. On a version conflict the
 * dialog invalidates the stale cache entry and reopens to reload the latest server
 * state. Mount once per page near the root of the component tree.
 *
 * @returns The rendered dialog element.
 */
export function EditProgramDialog() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { isOpen, program: listItem, open, close } = useEditProgramDialogStore()

  const { data: fullProgram, isPending } = useProgram(listItem?.id ?? null)

  function handleVersionConflict() {
    showError(t('pages.programs.editDialog.toast.versionConflict'))
    if (listItem) {
      void queryClient.invalidateQueries({ queryKey: PROGRAM_QUERY_KEY(listItem.id) })
      close()
      open(listItem)
    } else {
      close()
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) close()
      }}
    >
      <DialogContent
        size="xl"
        className="max-h-[90vh]"
      >
        <DialogHeader>
          <DialogTitle>{t('pages.programs.editDialog.title')}</DialogTitle>
          <DialogDescription>{t('pages.programs.editDialog.description')}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isPending ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : fullProgram != null ? (
            <EditProgramForm
              program={fullProgram}
              onVersionConflict={handleVersionConflict}
            />
          ) : null}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
