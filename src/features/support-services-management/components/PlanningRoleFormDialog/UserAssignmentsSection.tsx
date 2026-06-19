import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { PersonPicker } from '@/shared/components'
import { cn } from '@/shared/lib/utils'

import { PERSON_SEARCH_PAGE_SIZE } from '../../api/personsApi'
import { useAddUserToPlanningRole } from '../../hooks/useAddUserToPlanningRole'
import { useRemoveUserFromPlanningRole } from '../../hooks/useRemoveUserFromPlanningRole'
import { useSearchPersons } from '../../hooks/useSearchPersons'
import { useUpdatePlanningRoleUserAssignment } from '../../hooks/useUpdatePlanningRoleUserAssignment'
import { AssignmentRow } from './AssignmentRow'
import type { UserAssignment } from './AssignmentRow'

interface UserAssignmentsSectionProps {
  /** Project ID for scoping mutations. */
  projectId: string
  /** Planning role ID for all assignment mutations. */
  planningRoleId: string
  /** Current capacity per week (watched from form) for computing unassigned. */
  watchedCapacity: number
  /** Current user assignments from the planning role. */
  userAssignments: UserAssignment[]
  /** Called when a mutation fails, so the parent can display the error. */
  onError: (msg: string) => void
}

/**
 * User assignment list for the planning role edit dialog.
 *
 * Shows existing assignments with editable capacity and a remove button each.
 * Displays computed assigned / unassigned totals.
 * Renders a PersonPicker to add new users immediately on selection.
 *
 * @param props - Component props.
 * @param props.projectId - Project ID for mutation scope.
 * @param props.planningRoleId - Role ID for all assignment mutations.
 * @param props.watchedCapacity - Capacity per week (form-watched value).
 * @param props.userAssignments - Current assignment list from the role.
 * @param props.onError - Error callback for the parent's server-error state.
 * @returns The rendered user assignment management section.
 */
// eslint-disable-next-line max-lines-per-function -- add/remove/update assignment mutations, capacity totals, and PersonPicker are all tightly scoped to this section; extraction adds prop-threading with no reuse benefit
export function UserAssignmentsSection({
  projectId,
  planningRoleId,
  watchedCapacity,
  userAssignments,
  onError,
}: UserAssignmentsSectionProps) {
  const { t } = useTranslation()

  const addUserMutation = useAddUserToPlanningRole(projectId)
  const removeUserMutation = useRemoveUserFromPlanningRole(projectId)
  const updateAssignmentMutation = useUpdatePlanningRoleUserAssignment(projectId)

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const assignedTotal = userAssignments.reduce((sum, a) => sum + a.assignedCapacity, 0)
  const unassigned = watchedCapacity - assignedTotal

  const assignedPersonIds = useMemo(
    () =>
      new Set(
        userAssignments.map((a) => a.person?.id).filter((id): id is string => id !== undefined),
      ),
    [userAssignments],
  )

  const handlePersonSearch = useSearchPersons()

  function handlePersonSelected(personId: string | null) {
    if (!personId) return
    setSelectedUserId(personId)
    const cap = unassigned > 0 ? parseFloat(unassigned.toFixed(2)) : 1
    void addUserMutation
      .mutateAsync({ roleId: planningRoleId, userId: personId, assignedCapacity: cap })
      .then(() => {
        setSelectedUserId(null)
      })
      .catch((_err: unknown) => {
        onError(t('features.planningRolesManagement.toast.saveFailed'))
        setSelectedUserId(null)
      })
  }

  // Computed labels assembled outside JSX to avoid react/jsx-no-literals on template literals.
  const assignedLabel = `${t('features.planningRolesManagement.form.computed.assigned')}: `
  const unassignedLabel = `${t('features.planningRolesManagement.form.computed.unassigned')}: `

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">
        {t('features.planningRolesManagement.form.fields.user')}
      </p>

      {userAssignments.length > 0 && (
        <div className="divide-y rounded-md border">
          {userAssignments.map((assignment) => (
            <AssignmentRow
              key={assignment.id}
              assignment={assignment}
              planningRoleId={planningRoleId}
              disabled={
                removeUserMutation.isPending ||
                updateAssignmentMutation.isPending ||
                addUserMutation.isPending
              }
              onError={onError}
              updateMutation={updateAssignmentMutation}
              removeMutation={removeUserMutation}
            />
          ))}
        </div>
      )}

      <div className="text-muted-foreground flex gap-4 text-sm">
        <span>
          {assignedLabel}
          <span className="text-foreground font-medium">{assignedTotal.toFixed(2)}</span>
        </span>
        <span>
          {unassignedLabel}
          <span
            className={cn('font-medium', unassigned < 0 ? 'text-destructive' : 'text-foreground')}
          >
            {unassigned.toFixed(2)}
          </span>
        </span>
      </div>

      <PersonPicker
        value={selectedUserId}
        onChange={handlePersonSelected}
        onSearch={handlePersonSearch}
        pageSize={PERSON_SEARCH_PAGE_SIZE}
        excludeIds={assignedPersonIds}
        storageKey="planning-role-person-picker"
        disabled={addUserMutation.isPending}
        placeholder={t('features.planningRolesManagement.form.addPersonPlaceholder')}
      />
    </div>
  )
}
