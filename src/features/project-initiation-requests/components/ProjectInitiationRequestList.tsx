import { useCallback, useMemo, useState } from 'react'

import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { ProjectInitiationRequest } from '@/entities/project-initiation-request'
import { Button, ListView } from '@/shared/components'
import type { TableColumn, TablePaginationState, TableSortState } from '@/shared/components'
import { cn, getGraphQLErrorMessage } from '@/shared/lib/utils'

import {
  deletePIRWithToast,
  useDeleteProjectInitiationRequest,
} from '../hooks/useDeleteProjectInitiationRequest'
import { ProjectInitiationRequestStatusBadge } from './ProjectInitiationRequestStatusBadge'

/** Props for the ProjectInitiationRequestList component. */
export interface ProjectInitiationRequestListProps {
  /** The list of PIRs to display. */
  requests: ProjectInitiationRequest[]
  /** Whether the query is still loading. */
  isPending: boolean
  /** Whether the data fetch failed. */
  isError?: boolean
  /** className forwarded to the Card wrapper. */
  cardClassName?: string
}

const PAGE_SIZE = 25

// Builds column definitions outside the component to keep it under the max-lines-per-function limit.
function getColumns(
  t: ReturnType<typeof useTranslation>['t'],
  locale: string,
  deleteMutateAsync: ReturnType<typeof useDeleteProjectInitiationRequest>['mutateAsync'],
): TableColumn<ProjectInitiationRequest>[] {
  return [
    {
      id: 'name',
      header: t('pages.initiationRequests.list.columns.name'),
      cell: (row) => (
        <Link
          to={`/initiation-requests/${row.id}`}
          className={cn(
            'rounded hover:underline focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
            row.status === 'accepted' && 'text-muted-foreground opacity-75',
          )}
        >
          {row.name}
        </Link>
      ),
      sortable: true,
      minWidth: 200,
    },
    {
      id: 'status',
      header: t('pages.initiationRequests.list.columns.status'),
      cell: (row) => <ProjectInitiationRequestStatusBadge status={row.status} />,
      minWidth: 120,
    },
    {
      id: 'updatedAt',
      header: t('pages.initiationRequests.list.columns.updatedAt'),
      cell: (row) =>
        row.updatedAt
          ? new Date(row.updatedAt).toLocaleDateString(locale)
          : t('pages.initiationRequests.list.noDate'),
      sortable: true,
      minWidth: 140,
    },
    {
      id: 'actions',
      header: '',
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('pages.initiationRequests.list.deleteButton')}
          onClick={() =>
            deletePIRWithToast(deleteMutateAsync, row.id, {
              loading: t('pages.initiationRequests.toast.deleting'),
              success: t('pages.initiationRequests.toast.deleteSuccess'),
              error: (err) =>
                getGraphQLErrorMessage(err, t('pages.initiationRequests.toast.deleteError')),
            })
          }
        >
          <Trash2 className="text-destructive h-4 w-4" />
        </Button>
      ),
      minWidth: 56,
    },
  ]
}

/**
 * Renders a sortable, paginated table of project initiation requests.
 * Each name cell links to the detail page. Accepted rows are visually de-emphasised.
 * An actions column provides a delete button per row.
 *
 * @param props - Component props.
 * @param props.requests - The list of PIRs to display.
 * @param props.isPending - Whether the query is still loading.
 * @returns The PIR list table.
 */
export function ProjectInitiationRequestList({
  requests,
  isPending,
  cardClassName,
}: ProjectInitiationRequestListProps) {
  const { t, i18n } = useTranslation()
  const { mutateAsync: deleteMutateAsync } = useDeleteProjectInitiationRequest()
  const columns = useMemo(
    () => getColumns(t, i18n.language, deleteMutateAsync),
    [t, i18n.language, deleteMutateAsync],
  )

  const [sort, setSort] = useState<TableSortState | null>(null)
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    if (!sort) return requests
    return [...requests].sort((a, b) => {
      const toStr = (val: unknown) => (typeof val === 'string' ? val : String(val ?? ''))
      const cmp = toStr(a[sort.field as keyof ProjectInitiationRequest]).localeCompare(
        toStr(b[sort.field as keyof ProjectInitiationRequest]),
      )
      return sort.direction === 'asc' ? cmp : -cmp
    })
  }, [requests, sort])

  const rows = useMemo(() => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [sorted, page])

  const handleSortChange = useCallback((next: TableSortState | null) => {
    setSort(next)
    setPage(1)
  }, [])

  const totalItems = sorted.length
  const paginationProps: TablePaginationState | undefined =
    totalItems > PAGE_SIZE
      ? { page, pageSize: PAGE_SIZE, totalItems, onPageChange: setPage }
      : undefined

  return (
    <ListView<ProjectInitiationRequest>
      cardClassName={cardClassName}
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      loading={isPending}
      loadingRowsCount={5}
      sort={sort}
      onSortChange={handleSortChange}
      pagination={paginationProps}
      enableColumnReordering
      stickyHeader
      containerClassName="flex-1 overflow-auto"
      emptyTitle={t('shared.table.noDataTitle')}
      emptyDescription={t('shared.table.noDataDescription')}
    />
  )
}
