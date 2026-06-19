import { useTranslation } from 'react-i18next'

import type { ProjectWorkItem } from '@/entities/work-item'
import { ConfirmDialog } from '@/shared/components'

interface PoolArchiveConfirmDialogProps {
  pendingArchive: ProjectWorkItem | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * Confirmation dialog displayed before archiving a pool work item.
 * @param props - Component props.
 * @returns The rendered archive confirmation dialog.
 */
export function PoolArchiveConfirmDialog({
  pendingArchive,
  onOpenChange,
  onConfirm,
}: PoolArchiveConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <ConfirmDialog
      open={pendingArchive !== null}
      onOpenChange={onOpenChange}
      title={t('pages.taskManagement.archiveConfirm.title', 'Archive task?')}
      description={t(
        'pages.taskManagement.archiveConfirm.description',
        'The task will be moved to the archive. You can restore it at any time.',
      )}
      confirmLabel={t('pages.taskManagement.archive_action', 'Archive')}
      variant="destructive"
      onConfirm={onConfirm}
    />
  )
}
