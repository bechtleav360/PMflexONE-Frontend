import { useMemo, useState } from 'react'

import { ListFilter, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  buildPortfolioFilterFields,
  CreatePortfolioDialog,
  DeletePortfolioDialog,
  EditPortfolioDialog,
  PortfolioList,
  useCreatePortfolioDialogStore,
  useDeletePortfolioDialogStore,
  useEditPortfolioDialogStore,
  usePortfolioFilterState,
  usePortfolioListState,
  usePortfolios,
} from '@/features/portfolios'
import { Button, ButtonIcon, FilterBar } from '@/shared/components'
import { PageContent } from '@/widgets/Layout'

/**
 * Page listing all portfolios with create/edit/delete actions.
 *
 * Filter state is managed by {@link usePortfolioFilterState}; the derived
 * `graphqlFilter` is forwarded to {@link usePortfolios} for server-side filtering.
 * Sort is applied client-side on the returned rows via {@link usePortfolioListState}.
 *
 * @returns The rendered page.
 */
export function PortfoliosPage() {
  const { t } = useTranslation()
  const [showFilter, setShowFilter] = useState(false)
  const openCreate = useCreatePortfolioDialogStore((s) => s.open)
  const openEdit = useEditPortfolioDialogStore((s) => s.open)
  const openDelete = useDeletePortfolioDialogStore((s) => s.open)

  const { filter, setFilter, resetFilter, isFiltered, graphqlFilter } = usePortfolioFilterState()
  const {
    data: portfolios = [],
    isPending,
    isError,
    refetch,
  } = usePortfolios({ filter: graphqlFilter })
  const { rows, sort, setSort } = usePortfolioListState(portfolios)

  const filterFields = useMemo(() => buildPortfolioFilterFields(t), [t])

  return (
    <PageContent variant="full-height">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('pages.portfolios.title')}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilter((v) => !v)}
            aria-pressed={showFilter}
          >
            <ButtonIcon icon={ListFilter} />
            {t('pages.portfolios.filterButton')}
          </Button>
          <Button onClick={openCreate}>
            <ButtonIcon icon={Plus} />
            {t('pages.portfolios.createButton')}
          </Button>
        </div>
      </div>

      {showFilter && (
        <div className="mt-4">
          <FilterBar
            fields={filterFields}
            value={filter}
            onChange={setFilter}
            onReset={resetFilter}
            isFiltered={isFiltered}
          />
        </div>
      )}

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        {isError ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">{t('pages.portfolios.error.title')}</p>
            <Button
              variant="outline"
              onClick={() => void refetch()}
            >
              {t('pages.portfolios.error.retry')}
            </Button>
          </div>
        ) : (
          <PortfolioList
            rows={rows}
            isPending={isPending}
            sort={sort}
            onSortChange={setSort}
            onEdit={openEdit}
            onDelete={openDelete}
            cardClassName="flex min-h-0 flex-1 flex-col"
          />
        )}
      </div>

      <CreatePortfolioDialog />
      <EditPortfolioDialog />
      <DeletePortfolioDialog />
    </PageContent>
  )
}
