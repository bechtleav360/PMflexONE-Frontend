import { useTranslation } from 'react-i18next'

import type {
  DomainType,
  MatrixTask,
  ResolvedMatrixColumn,
  RoleGroup,
  TaskGroup,
} from '@/entities/role'
import { MatrixTable } from '@/shared/components/MatrixTable'

import { useSortedMatrixData } from '../hooks/useSortedMatrixData'
import { useRasciMatrixStore } from '../store/rasciMatrixStore'
import { BulkOverrideDialog } from './BulkOverrideDialog'
import { BulkSelectionToolbar } from './BulkSelectionToolbar'
import { RasciMatrixHead } from './RasciMatrixHead'
import { RasciMatrixToolbar } from './RasciMatrixToolbar'
import { RasciTaskGroupRow } from './RasciTaskGroupRow'
import { RasciTaskRow } from './RasciTaskRow'

interface RasciMatrixProps {
  /** Resolved matrix columns (one per role). */
  columns: ResolvedMatrixColumn[]
  /** All tasks in the matrix. */
  tasks: MatrixTask[]
  /** Task groups for grouping rows. */
  taskGroups: TaskGroup[]
  /** Role groups for grouping columns. */
  roleGroups: RoleGroup[]
  /** The object ID. */
  objectId: string
  /** The domain type of the object. */
  domainType: DomainType
  /** Whether the current user can override cell values. */
  canEdit: boolean
  /** Whether the current user can add custom roles. */
  canAddRole: boolean
}

/**
 * Full RASCI matrix table component.
 *
 * Renders a two-level `<thead>`:
 * - Row 1: Individual role headers with shortTitle, tooltip and action buttons.
 * - Row 2: RoleGroup headers with colspan spanning roles in that group.
 *
 * `<tbody>`: rows grouped by TaskGroup, with sub-header rows and `<RasciCell>` per cell.
 *
 * @param props - Matrix configuration.
 * @returns The rendered matrix table.
 */
// eslint-disable-next-line max-lines-per-function -- matrix component; tbody row rendering and dialog mounting drive the line count, not extractable logic
export function RasciMatrix({
  columns,
  tasks,
  taskGroups,
  roleGroups,
  objectId,
  domainType,
  canEdit,
  canAddRole,
}: RasciMatrixProps) {
  const { t } = useTranslation()
  const {
    openObjectRoleDialog,
    bulkSelectedCells,
    isBulkMode,
    toggleBulkMode,
    isBulkOverrideOpen,
    openBulkOverride,
    clearBulkSelection,
  } = useRasciMatrixStore()
  const bulkCount = bulkSelectedCells.size

  const {
    orderedRoleGroups,
    groupPaletteIndex,
    sortedColumns,
    cellMap,
    tasksByGroup,
    orderedTaskGroups,
  } = useSortedMatrixData(columns, tasks, taskGroups, roleGroups)

  return (
    <div className="space-y-3">
      {(canAddRole || canEdit) && (
        <RasciMatrixToolbar
          canEdit={canEdit}
          canAddRole={canAddRole}
          isBulkMode={isBulkMode}
          onToggleBulkMode={toggleBulkMode}
          onAddRole={openObjectRoleDialog}
        />
      )}

      <MatrixTable aria-label={t('pages.rasciMatrix.title')}>
        <RasciMatrixHead
          sortedColumns={sortedColumns}
          orderedRoleGroups={orderedRoleGroups}
          groupPaletteIndex={groupPaletteIndex}
        />

        <tbody>
          {orderedTaskGroups.flatMap((tg) => {
            const groupTasks = tasksByGroup.get(tg.id) ?? []
            if (groupTasks.length === 0) return []
            return [
              <RasciTaskGroupRow
                key={`group-${tg.id}`}
                taskGroup={tg}
                groupTasks={groupTasks}
                sortedColumns={sortedColumns}
                canEdit={canEdit}
              />,
              ...groupTasks.map((task) => (
                <RasciTaskRow
                  key={task.id}
                  task={task}
                  sortedColumns={sortedColumns}
                  cellMap={cellMap}
                  canEdit={canEdit}
                />
              )),
            ]
          })}

          {(tasksByGroup.get(null) ?? []).map((task) => (
            <RasciTaskRow
              key={task.id}
              task={task}
              sortedColumns={sortedColumns}
              cellMap={cellMap}
              canEdit={canEdit}
            />
          ))}
        </tbody>
      </MatrixTable>

      <BulkOverrideDialog
        objectId={objectId}
        domainType={domainType}
      />

      {canEdit && bulkCount > 0 && !isBulkOverrideOpen && (
        <BulkSelectionToolbar
          count={bulkCount}
          onEdit={openBulkOverride}
          onClear={clearBulkSelection}
        />
      )}
    </div>
  )
}
