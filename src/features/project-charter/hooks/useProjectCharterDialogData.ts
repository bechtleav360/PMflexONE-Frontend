import { useTranslation } from 'react-i18next'

import { useGetProjectCharter, useGetProjectCharterByProjectId } from '@/entities/project-charter'

/**
 * Fetches charter summary + full charter node for a project; composes loading state and derived flags.
 *
 * @param projectId - The project whose charter should be loaded.
 * @returns Charter data, loading flag, existence flag, accepted flag, and dialog title.
 */
export function useProjectCharterDialogData(projectId: string) {
  const { t } = useTranslation()
  const { data: charterSummary, isPending: isSummaryLoading } =
    useGetProjectCharterByProjectId(projectId)
  const { data: charter, isPending: isCharterLoading } = useGetProjectCharter(
    charterSummary?.id ?? '',
  )
  const isLoading = isSummaryLoading || (!!charterSummary?.id && isCharterLoading)
  const hasExisting = !!charterSummary
  const isAccepted = charter?.status === 'ACCEPTED'
  const dialogTitle = hasExisting
    ? t('pages.projectCharter.detailPage.heading')
    : t('pages.projectCharter.newPage.heading')
  return { charterSummary, charter, isLoading, hasExisting, isAccepted, dialogTitle }
}
