import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/utils'

import type { TablePaginationState } from './TableTypes'
import { getPaginationRange } from './tableUtils'

interface TablePaginationProps {
  pagination: TablePaginationState
}

/**
 * Renders the shared table footer with pagination controls.
 *
 * @param props - Component props.
 * @param props.pagination - Pagination state and callbacks.
 * @returns The pagination footer, or nothing when pagination is not enabled.
 */
export function TablePagination({ pagination }: TablePaginationProps) {
  const { t } = useTranslation()
  const paginationRange = getPaginationRange(
    pagination.page,
    pagination.pageSize,
    pagination.totalItems,
  )
  const totalPages = paginationRange.totalPages || 1
  const canGoBackward = pagination.totalItems > 0 && pagination.page > 1
  const canGoForward = pagination.totalItems > 0 && pagination.page < totalPages

  return (
    <div className="text-muted-foreground mt-lg gap-md border-border px-xs pt-lg flex flex-col border-t sm:flex-row sm:items-center sm:justify-between">
      <div className="gap-md flex items-center">
        <span className="text-sm">{t('shared.table.pageSizeLabel')}</span>
        {pagination.onPageSizeChange &&
        pagination.pageSizeOptions &&
        pagination.pageSizeOptions.length > 0 ? (
          <select
            className="border-input bg-background text-foreground focus-visible:ring-ring px-md py-sm rounded-md border text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            value={pagination.pageSize}
            onChange={(event) => pagination.onPageSizeChange?.(Number(event.target.value))}
            aria-label={t('shared.table.pageSizeLabel')}
          >
            {pagination.pageSizeOptions.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-foreground text-sm font-medium">{pagination.pageSize}</span>
        )}
        <span className="text-sm">
          {t('shared.table.paginationRange', {
            from: paginationRange.from,
            to: paginationRange.to,
            total: pagination.totalItems,
          })}
        </span>
      </div>

      <div className="gap-sm flex items-center">
        <button
          type="button"
          className={cn(
            'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          )}
          onClick={() => pagination.onPageChange(1)}
          disabled={!canGoBackward}
          aria-label={t('shared.table.firstPage')}
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={cn(
            'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          )}
          onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
          disabled={!canGoBackward}
          aria-label={t('shared.table.previousPage')}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={cn(
            'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          )}
          onClick={() => pagination.onPageChange(Math.min(totalPages, pagination.page + 1))}
          disabled={!canGoForward}
          aria-label={t('shared.table.nextPage')}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={cn(
            'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          )}
          onClick={() => pagination.onPageChange(totalPages)}
          disabled={!canGoForward}
          aria-label={t('shared.table.lastPage')}
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
