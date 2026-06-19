import { useTranslation } from 'react-i18next'

import { Button, type TableSortState } from '@/shared/components'

import { useCreateProgramDialogStore } from '../store/useCreateProgramDialogStore'
import type { Program } from '../types/program.types'
import { ProgramList } from './ProgramList'

/** Props for {@link PortfolioProgramsSection}. */
interface PortfolioProgramsSectionProps {
  /** Id of the portfolio whose programs are displayed. */
  portfolioId: string
  /** Sorted program rows to display. */
  rows: Program[]
  /** Whether the data fetch is in-flight. */
  isPending: boolean
  /** Whether the data fetch failed. */
  isError: boolean
  /** Current sort state passed to the table. */
  sort: TableSortState | null
  /** Called when the user changes the sort column or direction. */
  onSortChange: (sort: TableSortState | null) => void
  /** Called when the user clicks the edit action for a program row. */
  onEdit: (program: Program) => void
}

/**
 * Programs section rendered on the portfolio detail page: heading, "New Program"
 * button that opens the create-program dialog pre-scoped to the portfolio, and the
 * sortable {@link ProgramList} table.
 *
 * @param props - Component props.
 * @param props.portfolioId - Id of the portfolio whose programs are displayed.
 * @param props.rows - Sorted program rows to display.
 * @param props.isPending - Whether the data fetch is in-flight.
 * @param props.isError - Whether the data fetch failed.
 * @param props.sort - Current sort state passed to the table.
 * @param props.onSortChange - Called when the user changes the sort column or direction.
 * @param props.onEdit - Called when the user clicks the edit action for a program row.
 * @returns The rendered programs section.
 */
export function PortfolioProgramsSection({
  portfolioId,
  rows,
  isPending,
  isError,
  sort,
  onSortChange,
  onEdit,
}: PortfolioProgramsSectionProps) {
  const { t } = useTranslation()
  const openCreateProgram = useCreateProgramDialogStore((s) => s.open)
  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('pages.portfolios.detail.programsSection')}</h2>
        <Button
          onClick={() => {
            openCreateProgram(portfolioId)
          }}
        >
          {t('pages.portfolios.detail.newProgram')}
        </Button>
      </div>
      <ProgramList
        portfolioId={portfolioId}
        rows={rows}
        isPending={isPending}
        isError={isError}
        sort={sort}
        onSortChange={onSortChange}
        onEdit={onEdit}
      />
    </div>
  )
}
