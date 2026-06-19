import { useMemo, useState } from 'react'

import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Badge,
  Button,
  ButtonIcon,
  Combobox,
  Input,
  ListView,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  type TableColumn,
  type TableSortState,
} from '@/shared/components'

import { usePlanningRoles } from '../../hooks/usePlanningRoles'
import { useSupportServiceTree } from '../../hooks/useSupportServices'
import { useSupportServicesUiStore } from '../../store/supportServicesUiStore'
import type { SupportService } from '../../types/supportService.types'

const PAGE_SIZE = 25

/** Stable empty array to avoid useMemo invalidation while treeData loads. */
const EMPTY_FLAT: SupportService[] = []

interface SupportServiceListViewProps {
  /** Project ID used to fetch the flat support service list. */
  projectId: string
  /** Whether write actions (edit, delete) are rendered. */
  canWrite: boolean
}

/**
 * Builds the column definitions for the support service table.
 *
 * @param t - Translation function.
 * @param canWrite - Whether write-only columns are included.
 * @param openFormDialog - Opens the form dialog for a support service (edit mode).
 * @param openDeleteDialog - Opens the delete confirmation dialog.
 * @returns An array of `TableColumn` definitions.
 */
function createColumns(
  t: ReturnType<typeof useTranslation>['t'],
  canWrite: boolean,
  openFormDialog: (id: string) => void,
  openDeleteDialog: (id: string, version: number, hasChildren: boolean) => void,
): TableColumn<SupportService>[] {
  const base: TableColumn<SupportService>[] = [
    {
      id: 'name',
      header: t('features.supportServicesManagement.columns.name'),
      sortable: true,
      sortKey: 'name',
      cell: (row) => (
        <button
          type="button"
          className="hover:text-primary text-left underline-offset-2 hover:underline"
          onClick={() => openFormDialog(row.id)}
        >
          {row.name}
        </button>
      ),
    },
    {
      id: 'assignee',
      header: t('features.supportServicesManagement.columns.assignee'),
      cell: (row) => row.assignee?.node.name ?? '—',
      width: 200,
    },
    {
      id: 'estimatedEffort',
      header: t('features.supportServicesManagement.columns.estimatedEffort'),
      sortable: true,
      sortKey: 'estimatedEffort',
      cell: (row) =>
        row.estimatedEffort !== null ? `${row.estimatedEffort} ${t('common.unitPt')}` : '—',
      width: 160,
    },
  ]

  if (!canWrite) return base

  return [
    ...base,
    {
      id: 'actions',
      header: '',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('features.supportServicesManagement.actions.edit')}
                onClick={() => openFormDialog(row.id)}
              >
                <Pencil
                  className="size-4"
                  aria-hidden="true"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('features.supportServicesManagement.actions.edit')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('features.supportServicesManagement.actions.delete')}
                onClick={() => openDeleteDialog(row.id, row.version, row.children.length > 0)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2
                  className="size-4"
                  aria-hidden="true"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t('features.supportServicesManagement.actions.delete')}
            </TooltipContent>
          </Tooltip>
        </div>
      ),
      width: 96,
      align: 'right',
    },
  ]
}

/**
 * Flat, paginated, sortable list view for support services.
 *
 * Shares the `useSupportServiceTree` cache with the tree view — switching tabs
 * never triggers a second network request. Renders a `Table` with columns for
 * name, assignee (planning role), estimated effort, and actions.
 * Includes an assignee filter (multi-select from planning roles).
 *
 * @param props - Component props.
 * @param props.projectId - Project ID for data fetching.
 * @param props.canWrite - Whether write actions (edit, delete) are rendered.
 * @returns The rendered support service list.
 */
// eslint-disable-next-line max-lines-per-function -- toolbar + filter state + pagination + column defs are tightly coupled to one render scope; splitting would scatter shared state across multiple components
export function SupportServiceListView({ projectId, canWrite }: SupportServiceListViewProps) {
  const { t } = useTranslation()

  const openDeleteDialog = useSupportServicesUiStore((s) => s.openDeleteDialog)
  const openFormDialog = useSupportServicesUiStore((s) => s.openFormDialog)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<TableSortState | null>({ field: 'name', direction: 'asc' })
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([])

  const { data: treeData, isPending } = useSupportServiceTree(projectId)
  const flat = useMemo(() => treeData?.flat ?? EMPTY_FLAT, [treeData?.flat])

  // Assignee filter options from planning roles
  const { data: planningRoles = [] } = usePlanningRoles(projectId)
  const assigneeFilterOptions = useMemo(
    () => planningRoles.map((r) => ({ value: r.id, label: r.name })),
    [planningRoles],
  )

  // Client-side search
  const filtered = useMemo(() => {
    let result = flat
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((s) => s.name.toLowerCase().includes(q))
    }
    // Assignee filter
    if (selectedAssigneeIds.length > 0) {
      result = result.filter((s) => s.assignee && selectedAssigneeIds.includes(s.assignee.node.id))
    }
    return result
  }, [flat, search, selectedAssigneeIds])

  // Client-side sort
  const sorted = useMemo(() => {
    if (!sort) return filtered
    // eslint-disable-next-line complexity -- null-handling, string, and numeric comparison branches are inherently sequential
    return [...filtered].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1
      const field = sort.field
      if (!(field in a)) return 0
      const av = (a as Record<string, unknown>)[field]
      const bv = (b as Record<string, unknown>)[field]
      // Sort nulls/undefined to the end regardless of direction.
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'string' && typeof bv === 'string') {
        return av.localeCompare(bv) * dir
      }
      return av < bv ? -dir : av > bv ? dir : 0
    })
  }, [filtered, sort])

  // Client-side pagination
  const totalItems = sorted.length
  const maxPage = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.min(page, maxPage)
  const start = (safePage - 1) * PAGE_SIZE
  const pageRows = sorted.slice(start, start + PAGE_SIZE)

  const columns = useMemo(
    () => createColumns(t, canWrite, openFormDialog, openDeleteDialog),
    [t, canWrite, openFormDialog, openDeleteDialog],
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="search"
            aria-label={t('features.supportServicesManagement.search.placeholder')}
            placeholder={t('features.supportServicesManagement.search.placeholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="max-w-xs"
          />
          {/* Assignee multi-select filter (FR-019) */}
          <div className="flex flex-wrap items-center gap-1">
            <div className="w-48">
              <Combobox
                value={null}
                onChange={(v) => {
                  if (v && !selectedAssigneeIds.includes(v)) {
                    setSelectedAssigneeIds((prev) => [...prev, v])
                    setPage(1)
                  }
                }}
                options={assigneeFilterOptions.filter(
                  (o) => !selectedAssigneeIds.includes(o.value),
                )}
                placeholder={t('features.supportServicesManagement.fields.assignee')}
              />
            </div>
            {selectedAssigneeIds.map((id) => {
              const label = assigneeFilterOptions.find((o) => o.value === id)?.label ?? id
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {label}
                  <button
                    type="button"
                    aria-label={t('features.supportServicesManagement.filter.removeAssignee', {
                      name: label,
                    })}
                    className="ml-0.5 rounded-full focus-visible:ring-1 focus-visible:outline-none"
                    onClick={() => {
                      setSelectedAssigneeIds((prev) => prev.filter((x) => x !== id))
                      setPage(1)
                    }}
                  >
                    <X
                      className="size-3"
                      aria-hidden="true"
                    />
                  </button>
                </Badge>
              )
            })}
          </div>
        </div>

        {canWrite && (
          <Button
            size="sm"
            onClick={() => openFormDialog()}
          >
            <ButtonIcon icon={Plus} />
            {t('features.supportServicesManagement.actions.create')}
          </Button>
        )}
      </div>

      <ListView<SupportService>
        columns={columns}
        rows={pageRows}
        getRowKey={(row) => row.id}
        sort={sort}
        onSortChange={(s) => {
          setSort(s)
          setPage(1)
        }}
        loading={isPending}
        pagination={{
          page: safePage,
          pageSize: PAGE_SIZE,
          totalItems,
          onPageChange: setPage,
        }}
      />
    </div>
  )
}
