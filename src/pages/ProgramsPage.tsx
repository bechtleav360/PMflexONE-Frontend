import { useMemo, useState } from 'react'

import { ListFilter, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import {
  buildProgramFilterFields,
  CreateProgramDialog,
  EditProgramDialog,
  ProgramList,
  useCreateProgramDialogStore,
  useEditProgramDialogStore,
  useProgramFilterState,
  useProgramListState,
  usePrograms,
} from '@/features/programs'
import { Button, ButtonIcon, FilterBar } from '@/shared/components'
import { PageContent } from '@/widgets/Layout'

/**
 * Page listing all programs with create and edit actions.
 *
 * Filter state is managed by {@link useProgramFilterState}; the derived
 * `graphqlFilter` is forwarded to {@link usePrograms} for server-side filtering.
 * Sort is applied client-side on the returned rows via {@link useProgramListState}.
 *
 * @returns The rendered page.
 */
export function ProgramsPage() {
  const { t } = useTranslation()
  const [showFilter, setShowFilter] = useState(false)
  const navigate = useNavigate()
  const openCreate = useCreateProgramDialogStore((s) => s.open)
  const openEdit = useEditProgramDialogStore((s) => s.open)

  const { filter, setFilter, resetFilter, isFiltered, graphqlFilter } = useProgramFilterState()
  const {
    data: programs = [],
    isPending,
    isError,
    refetch,
  } = usePrograms({ filter: graphqlFilter })
  const { rows, sort, setSort } = useProgramListState(programs)

  const filterFields = useMemo(() => buildProgramFilterFields(t), [t])

  return (
    <PageContent variant="full-height">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('pages.programs.title')}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilter((v) => !v)}
            aria-pressed={showFilter}
          >
            <ButtonIcon icon={ListFilter} />
            {t('pages.programs.filterButton')}
          </Button>
          <Button
            onClick={() => {
              openCreate()
            }}
          >
            <ButtonIcon icon={Plus} />
            {t('pages.programs.createButton')}
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
            <p className="text-muted-foreground">{t('pages.programs.error.title')}</p>
            <Button
              variant="outline"
              onClick={() => {
                void refetch()
              }}
            >
              {t('pages.programs.error.retry')}
            </Button>
          </div>
        ) : (
          <ProgramList
            rows={rows}
            isPending={isPending}
            isError={isError}
            sort={sort}
            onSortChange={setSort}
            onEdit={openEdit}
            onSelect={(program) => {
              void navigate(`/programs/${program.id}`)
            }}
            scrollable
            cardClassName="flex min-h-0 flex-1 flex-col"
          />
        )}
      </div>

      <CreateProgramDialog />
      <EditProgramDialog />
    </PageContent>
  )
}
