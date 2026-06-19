import { useMemo, useState } from 'react'

import { Plus, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, ButtonIcon, Input, ListView, type TableSortState } from '@/shared/components'

import { useDeliverableTree } from '../../hooks/useDeliverables'
import { useDeliverablesUiStore } from '../../store/deliverablesUiStore'
import type { Deliverable } from '../../types/deliverable.types'
import { createColumns } from './deliverableColumns'

const PAGE_SIZE = 25

/** Stable empty array to avoid useMemo invalidation while treeData loads. */
const EMPTY_FLAT: Deliverable[] = []

interface DeliverableListViewProps {
  /** Project ID used to fetch the flat deliverable list. */
  projectId: string
  /** Whether write actions (edit, delete) are rendered. */
  canWrite: boolean
}

/**
 * Flat, paginated, and sortable list view for deliverables.
 *
 * Shares the `useDeliverableTree` cache with the tree view — switching tabs
 * never triggers a second network request. Renders a `Table` with columns for
 * businessId, name, parent, owner, createdAt, and actions.
 *
 * @param props - Component props.
 * @param props.projectId - Project ID for data fetching.
 * @param props.canWrite - Whether write actions (edit, delete) are rendered.
 * @returns The rendered deliverable list with search, sort, and pagination.
 */
// eslint-disable-next-line max-lines-per-function -- orchestrates search, sort, pagination state + column factory + table render; extraction would scatter related view logic across multiple files
export function DeliverableListView({ projectId, canWrite }: DeliverableListViewProps) {
  const { t, i18n } = useTranslation()

  const openCreateModal = useDeliverablesUiStore((s) => s.openCreateModal)
  const openEditModal = useDeliverablesUiStore((s) => s.openEditModal)
  const openReadModal = useDeliverablesUiStore((s) => s.openReadModal)
  const openDeleteDialog = useDeliverablesUiStore((s) => s.openDeleteDialog)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<TableSortState | null>({
    field: 'createdAt',
    direction: 'desc',
  })

  const { data: treeData, isPending } = useDeliverableTree(projectId)
  const flat = useMemo(() => treeData?.flat ?? EMPTY_FLAT, [treeData?.flat])

  // Client-side search
  const filtered = useMemo(() => {
    if (!search) return flat
    const q = search.toLowerCase()
    return flat.filter(
      (d) => d.name.toLowerCase().includes(q) || (d.businessId ?? '').toLowerCase().includes(q),
    )
  }, [flat, search])

  // Client-side sort — use numeric-aware localeCompare so outline-style businessIds
  // sort correctly ("1.2" before "1.10" instead of the lexicographic "1.10" < "1.2").
  const sorted = useMemo(() => {
    if (!sort) return filtered
    return [...filtered].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1
      const field = sort.field as 'businessId' | 'name' | 'createdAt'
      const av = String(a[field] ?? '')
      const bv = String(b[field] ?? '')
      return av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' }) * dir
    })
  }, [filtered, sort])

  // Client-side pagination — clamp page so deletes never leave an empty view
  const totalItems = sorted.length
  const maxPage = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.min(page, maxPage)
  const start = (safePage - 1) * PAGE_SIZE
  const pageRows = sorted.slice(start, start + PAGE_SIZE)

  const columns = useMemo(
    () => createColumns(t, i18n.language, canWrite, openReadModal, openEditModal, openDeleteDialog),
    [t, i18n.language, canWrite, openReadModal, openEditModal, openDeleteDialog],
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative ml-auto">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            aria-label={t('features.deliverablesManagement.search.placeholder')}
            placeholder={t('features.deliverablesManagement.search.placeholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="h-9 w-60 pr-7 pl-8 text-sm"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearch('')
                setPage(1)
              }}
              aria-label={t('common.close')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-6 -translate-y-1/2"
            >
              <X
                className="size-3.5"
                aria-hidden="true"
              />
            </Button>
          )}
        </div>
        {canWrite && (
          <Button
            size="sm"
            onClick={() => openCreateModal()}
          >
            <ButtonIcon icon={Plus} />
            {t('features.deliverablesManagement.actions.create')}
          </Button>
        )}
      </div>

      <ListView
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
