import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useListProjectInitiationRequests } from '@/entities/project-initiation-request'
import {
  CreateProjectInitiationRequestDialog,
  ProjectInitiationRequestList,
  useCreatePirDialogStore,
} from '@/features/project-initiation-requests'
import { Button, ButtonIcon } from '@/shared/components'
import { PageContent } from '@/widgets/Layout'

/**
 * Overview page for all project initiation requests in the tenant.
 * Displays the list of requests and a button to open the creation dialog.
 *
 * Route: `/initiation-requests`
 *
 * @returns The initiation requests overview page.
 */
export function ProjectInitiationRequestsPage() {
  const { t } = useTranslation()
  const open = useCreatePirDialogStore((s) => s.open)
  const { data, isPending, isError, refetch } = useListProjectInitiationRequests()

  return (
    <PageContent variant="full-height">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('pages.initiationRequests.title')}</h1>
        <Button onClick={open}>
          <ButtonIcon icon={Plus} />
          {t('pages.initiationRequests.newRequestButton')}
        </Button>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        {isError ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">{t('pages.initiationRequests.error.title')}</p>
            <Button
              variant="outline"
              onClick={() => void refetch()}
            >
              {t('pages.initiationRequests.error.retry')}
            </Button>
          </div>
        ) : (
          <ProjectInitiationRequestList
            requests={data ?? []}
            isPending={isPending}
            cardClassName="flex min-h-0 flex-1 flex-col"
          />
        )}
      </div>

      <CreateProjectInitiationRequestDialog />
    </PageContent>
  )
}
