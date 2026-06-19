import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/shared/components'

interface PanelConfirmDialogsProps {
  /** Whether the archive confirmation dialog is open. */
  archiveConfirmOpen: boolean
  /** Callback to open or close the archive dialog. */
  setArchiveConfirmOpen: (open: boolean) => void
  /** Whether the delete confirmation dialog is open. */
  deleteConfirmOpen: boolean
  /** Callback to open or close the delete dialog. */
  setDeleteConfirmOpen: (open: boolean) => void
  /** Whether a delete operation is in progress. */
  isDeleting: boolean
  /** Called when the user confirms the archive action. */
  handleArchiveConfirmed: () => Promise<void>
  /** Called when the user confirms the delete action. */
  handleDeleteClick: () => void
}

/**
 * Renders the archive and delete confirmation dialogs for the task detail panel.
 * @param props - Component props.
 * @returns The archive and delete confirm dialogs.
 */
export function PanelConfirmDialogs({
  archiveConfirmOpen,
  setArchiveConfirmOpen,
  deleteConfirmOpen,
  setDeleteConfirmOpen,
  isDeleting,
  handleArchiveConfirmed,
  handleDeleteClick,
}: PanelConfirmDialogsProps) {
  const { t } = useTranslation()

  return (
    <>
      <ConfirmDialog
        open={archiveConfirmOpen}
        onOpenChange={setArchiveConfirmOpen}
        title={t('pages.taskManagement.archiveConfirm.title', 'Archive task?')}
        description={t(
          'pages.taskManagement.archiveConfirm.description',
          'The task will be moved to the archive. You can restore it at any time.',
        )}
        confirmLabel={t('pages.taskManagement.archive_action', 'Archive')}
        variant="destructive"
        onConfirm={() => {
          void handleArchiveConfirmed()
        }}
        isPending={false}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('pages.taskManagement.deleteConfirm.title', 'Delete task?')}
        description={t(
          'pages.taskManagement.deleteConfirm.description',
          'This action cannot be undone. The task and all its data will be permanently deleted.',
        )}
        confirmLabel={t('pages.taskManagement.delete_action', 'Delete')}
        variant="destructive"
        onConfirm={handleDeleteClick}
        isPending={isDeleting}
      />
    </>
  )
}
