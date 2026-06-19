import { useCallback, useMemo, useState } from 'react'

import { ListFilter, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useListProjects } from '@/entities/project'
import type { Project } from '@/entities/project'
import { useCreateProjectStore } from '@/features/create-project'
import { DeleteProjectDialog, useDeleteProjectStore } from '@/features/delete-project'
import { EditProjectModal, useEditProjectStore } from '@/features/edit-project'
import {
  buildProjectFilterFields,
  useProjectFilterState,
  useProjectListState,
} from '@/features/project-list'
import { Button, ButtonIcon, FilterBar, ListView } from '@/shared/components'
import type { TableColumn } from '@/shared/components'
import { PageContent } from '@/widgets/Layout'

type TFn = ReturnType<typeof useTranslation>['t']
type OpenDeleteFn = (id: string) => void
type OpenEditFn = (project: Project) => void

function buildColumns(
  t: TFn,
  openDeleteModal: OpenDeleteFn,
  openEditModal: OpenEditFn,
): TableColumn<Project>[] {
  return [
    {
      id: 'name',
      header: t('pages.projects.columns.name'),
      cell: (row) => (
        <Link
          to={`/projects/${row.id}`}
          className="rounded hover:underline focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
        >
          {row.name}
        </Link>
      ),
      sortable: true,
      minWidth: 200,
    },
    {
      id: 'sizeClassification',
      header: t('pages.projects.columns.sizeClassification'),
      cell: (row) =>
        row.sizeClassification
          ? t(`pages.projects.sizeClassification.${row.sizeClassification}`)
          : '—',
      sortable: true,
      minWidth: 100,
    },
    {
      id: 'startDate',
      header: t('pages.projects.columns.startDate'),
      cell: (row) => row.startDate ?? '—',
      sortable: true,
      minWidth: 120,
    },
    {
      id: 'endDate',
      header: t('pages.projects.columns.endDate'),
      cell: (row) => row.endDate ?? '—',
      sortable: true,
      minWidth: 120,
    },
    {
      id: 'governanceStatus',
      header: t('pages.projects.columns.governanceStatus'),
      cell: (row) =>
        row.governanceStatus ? t(`pages.projects.governanceStatus.${row.governanceStatus}`) : '—',
      sortable: true,
      minWidth: 160,
    },
    {
      id: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('features.editProject.editButton')}
            onClick={() => openEditModal(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('features.deleteProject.deleteButton')}
            onClick={() => openDeleteModal(row.id)}
          >
            <Trash2 className="text-destructive h-4 w-4" />
          </Button>
        </div>
      ),
      minWidth: 80,
    },
  ]
}

/**
 * Projects list page — displays all projects in a sortable, server-side-filterable table.
 *
 * Filter state is managed by {@link useProjectFilterState}; the derived `graphqlFilter`
 * is forwarded to {@link useListProjects} so the API returns only matching rows.
 * Sort and pagination are applied client-side on the returned rows via
 * {@link useProjectListState}.
 *
 * @returns The projects list page element.
 */
export function ProjectsPage() {
  const { t } = useTranslation()
  const [showFilter, setShowFilter] = useState(false)
  const openModal = useCreateProjectStore((s) => s.openModal)
  const openEditModal = useEditProjectStore((s) => s.openModal)
  const openDeleteModal = useDeleteProjectStore((s) => s.openModal)

  const { filter, setFilter, resetFilter, isFiltered, graphqlFilter } = useProjectFilterState()
  const { data, isPending, isError, refetch } = useListProjects({ filter: graphqlFilter })
  const { rows, sort, setSort, setPage, paginationProps } = useProjectListState(data ?? [])

  const filterFields = useMemo(() => buildProjectFilterFields(t), [t])

  const handleFilterChange = useCallback(
    (update: Partial<typeof filter>) => {
      setFilter(update)
      setPage(1)
    },
    [setFilter, setPage],
  )

  const handleReset = useCallback(() => {
    resetFilter()
    setPage(1)
  }, [resetFilter, setPage])

  return (
    <PageContent variant="full-height">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('pages.projects.title')}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilter((v) => !v)}
            aria-pressed={showFilter}
          >
            <ButtonIcon icon={ListFilter} />
            {t('pages.projects.filterButton')}
          </Button>
          <Button onClick={openModal}>
            <ButtonIcon icon={Plus} />
            {t('pages.projects.createButton')}
          </Button>
        </div>
      </div>

      {showFilter && (
        <div className="mt-4">
          <FilterBar
            fields={filterFields}
            value={filter}
            onChange={handleFilterChange}
            onReset={handleReset}
            isFiltered={isFiltered}
          />
        </div>
      )}

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        {isError ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">{t('pages.projects.error.title')}</p>
            <Button
              variant="outline"
              onClick={() => void refetch()}
            >
              {t('pages.projects.error.retry')}
            </Button>
          </div>
        ) : (
          <ListView
            cardClassName="flex min-h-0 flex-1 flex-col"
            columns={buildColumns(t, openDeleteModal, openEditModal)}
            rows={rows}
            getRowKey={(row) => row.id}
            loading={isPending}
            sort={sort}
            onSortChange={setSort}
            pagination={paginationProps}
            enableColumnReordering
            stickyHeader
            containerClassName="flex-1 overflow-auto"
            emptyTitle={t('shared.table.noDataTitle')}
            emptyDescription={t('shared.table.noDataDescription')}
          />
        )}
      </div>

      <EditProjectModal />
      <DeleteProjectDialog />
    </PageContent>
  )
}
