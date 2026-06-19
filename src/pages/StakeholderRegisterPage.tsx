import { useMemo, useState } from 'react'

import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import type { StakeholderEntry } from '@/entities/stakeholder'
import { useGetStakeholderEntries, useGetStrategyDescription } from '@/entities/stakeholder'
import {
  AffectednessFilter,
  DeleteStakeholderDialog,
  InfluenceAttitudeMatrixOverview,
  StakeholderDialog,
  StakeholderRegisterBreadcrumb,
  StakeholderRegisterListView,
  StrategyDescriptionsForm,
  useDeleteStakeholderDialogStore,
  useStakeholderDialogStore,
  useStakeholderRegisterScope,
} from '@/features/stakeholder-register'
import type { AffectednessFilterValue } from '@/features/stakeholder-register'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  Skeleton,
} from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'
import { PageContent } from '@/widgets/Layout'

/** Props for {@link StakeholderRegisterPage}. Both fields default to route params when omitted. */
export interface StakeholderRegisterPageProps {
  scopeType?: ScopeType
  scopeId?: string
}

/**
 * Aggregates data-fetching, filter state, and dialog actions for the Stakeholder Register page.
 *
 * @param scopeType - The FSD scope type (Project, Program, Portfolio).
 * @param scopeId - The ID of the scope whose stakeholders are displayed.
 * @returns Queries, filter state, cell selection, and dialog openers for the page.
 */
function useStakeholderRegisterPage(scopeType: ScopeType, scopeId: string) {
  const entriesQuery = useGetStakeholderEntries(scopeType, scopeId)
  const strategyQuery = useGetStrategyDescription(scopeType, scopeId)
  const openDialog = useStakeholderDialogStore((s) => s.openModal)
  const openDeleteDialog = useDeleteStakeholderDialogStore((s) => s.openModal)

  const [affectednessFilter, setAffectednessFilter] = useState<AffectednessFilterValue>('ALL')
  const [selectedCell, setSelectedCell] = useState<{ col: number; row: number } | null>(null)

  function handleCellClick(col: number, row: number) {
    setSelectedCell((prev) => (prev?.col === col && prev?.row === row ? null : { col, row }))
  }

  const filteredEntries = useMemo<StakeholderEntry[]>(() => {
    const allEntries = entriesQuery.data ?? []
    let result =
      affectednessFilter === 'ALL'
        ? allEntries
        : allEntries.filter((e) => (e.typeOfAffectedness ?? 'NEUTRAL') === affectednessFilter)
    if (selectedCell) {
      const { col, row } = selectedCell
      result = result.filter((e) => {
        if (!e.matrixPosition) return false
        const eCol = Math.min(5, Math.floor(e.matrixPosition.x * 6))
        const eRow = Math.min(5, Math.floor((1 - e.matrixPosition.y) * 6))
        return eCol === col && eRow === row
      })
    }
    return result
  }, [entriesQuery.data, affectednessFilter, selectedCell])

  return {
    isPending: entriesQuery.isPending || strategyQuery.isPending,
    isError: entriesQuery.isError,
    entries: entriesQuery.data,
    strategyDescription: strategyQuery.data ?? null,
    filteredEntries,
    openDialog,
    openDeleteDialog,
    affectednessFilter,
    setAffectednessFilter,
    selectedCell,
    handleCellClick,
  }
}

/**
 * Page component for the Stakeholder Register.
 *
 * Renders the influence-attitude matrix overview, affectedness filter,
 * strategy descriptions, and the full stakeholder entry table.
 * Accepts scope from route params or explicit props.
 *
 * @param props - Component props.
 * @param props.scopeType - Optional scope type override (defaults to route param).
 * @param props.scopeId - Optional scope ID override (defaults to route param).
 * @returns The full stakeholder register page.
 */
// eslint-disable-next-line max-lines-per-function -- page component with loading/error states and deep JSX layout; data-fetching logic already extracted into useStakeholderRegisterPage
export function StakeholderRegisterPage({
  scopeType: scopeTypeProp,
  scopeId: scopeIdProp,
}: StakeholderRegisterPageProps = {}) {
  const { t } = useTranslation()
  const params = useParams<{ id?: string }>()

  const scopeType = scopeTypeProp ?? 'Project'
  const scopeId = scopeIdProp ?? params.id ?? ''

  const scopeNav = useStakeholderRegisterScope(scopeType, scopeId)
  const {
    isPending,
    isError,
    entries,
    strategyDescription,
    filteredEntries,
    openDialog,
    openDeleteDialog,
    affectednessFilter,
    setAffectednessFilter,
    selectedCell,
    handleCellClick,
  } = useStakeholderRegisterPage(scopeType, scopeId)

  if (isPending) {
    return (
      <PageContent
        variant="scrollable"
        className="gap-4"
      >
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </PageContent>
    )
  }

  if (isError || !entries) {
    return (
      <PageContent>
        <Alert variant="destructive">
          <AlertTitle>{t('pages.stakeholderRegister.access.deniedTitle')}</AlertTitle>
          <AlertDescription>{t('pages.stakeholderRegister.access.deniedMessage')}</AlertDescription>
        </Alert>
      </PageContent>
    )
  }

  return (
    <PageContent variant="scrollable">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <StakeholderRegisterBreadcrumb {...scopeNav} />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t('pages.stakeholderRegister.pageTitle')}</h1>
          <Button onClick={() => openDialog(null)}>
            <Plus className="size-4" />
            {t('pages.stakeholderRegister.newButton')}
          </Button>
        </div>

        <AffectednessFilter
          value={affectednessFilter}
          onChange={setAffectednessFilter}
        />

        <div className="grid grid-cols-8 items-stretch gap-8">
          <div className="col-span-5">
            <Card className="h-full">
              <CardContent>
                <InfluenceAttitudeMatrixOverview
                  entries={filteredEntries}
                  onCellClick={handleCellClick}
                  selectedCell={selectedCell}
                />
              </CardContent>
            </Card>
          </div>
          <div className="col-span-3">
            <Card className="h-full">
              <CardContent>
                <StrategyDescriptionsForm
                  scopeType={scopeType}
                  scopeId={scopeId}
                  initialValues={strategyDescription}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <StakeholderRegisterListView
            entries={filteredEntries}
            onEdit={(entry) => openDialog(entry)}
            onDelete={(entry) => openDeleteDialog(entry)}
          />
        </div>
      </div>

      <StakeholderDialog
        scopeType={scopeType}
        scopeId={scopeId}
        strategyDescription={strategyDescription}
        existingEntries={entries}
      />
      <DeleteStakeholderDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
    </PageContent>
  )
}
