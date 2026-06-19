import { useEffect, useState } from 'react'

import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { z } from 'zod'

import { Button, PersonBadge, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components'

import type { planningRoleUserAssignmentSchema } from '../../api/supportServicesApi'
import type { useRemoveUserFromPlanningRole } from '../../hooks/useRemoveUserFromPlanningRole'
import type { useUpdatePlanningRoleUserAssignment } from '../../hooks/useUpdatePlanningRoleUserAssignment'
import { PtInput } from '../PtInput/PtInput'

/** Resolved type for a single planning role user assignment. */
export type UserAssignment = z.infer<typeof planningRoleUserAssignmentSchema>

interface AssignmentRowProps {
  assignment: UserAssignment
  planningRoleId: string
  disabled: boolean
  onError: (msg: string) => void
  updateMutation: ReturnType<typeof useUpdatePlanningRoleUserAssignment>
  removeMutation: ReturnType<typeof useRemoveUserFromPlanningRole>
}

/**
 * Single row in the planning role assignment list.
 *
 * Displays the assigned person, an editable capacity input, and a remove button.
 * Syncs local capacity state with the server value when the assignment is updated externally.
 *
 * @param props - Component props.
 * @param props.assignment - The user assignment to render.
 * @param props.planningRoleId - Planning role ID used for mutation calls.
 * @param props.disabled - Whether all controls in the row are disabled.
 * @param props.onError - Called when a mutation fails with an error message.
 * @param props.updateMutation - Mutation for updating assignment capacity.
 * @param props.removeMutation - Mutation for removing the assignment.
 * @returns The rendered assignment row.
 */
export function AssignmentRow({
  assignment,
  planningRoleId,
  disabled,
  onError,
  updateMutation,
  removeMutation,
}: AssignmentRowProps) {
  const { t } = useTranslation()
  const [capacity, setCapacity] = useState(String(assignment.assignedCapacity))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: syncs local input with server value after external update; single-dep effect, no cascade risk
    setCapacity(String(assignment.assignedCapacity))
  }, [assignment.assignedCapacity])

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="flex-1">
        {assignment.person ? (
          <PersonBadge
            firstName={assignment.person.firstName}
            lastName={assignment.person.lastName}
          />
        ) : (
          <span className="text-muted-foreground text-sm italic">
            {t('features.planningRolesManagement.form.unknownPerson')}
          </span>
        )}
      </div>
      <PtInput
        className="h-8 w-24 text-sm"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        onBlur={async () => {
          const val = parseFloat(capacity)
          if (!val || val <= 0) {
            onError(t('features.planningRolesManagement.validation.capacityMin'))
            setCapacity(String(assignment.assignedCapacity))
            return
          }
          try {
            await updateMutation.mutateAsync({
              roleId: planningRoleId,
              assignmentId: assignment.id,
              assignedCapacity: val,
            })
          } catch {
            onError(t('features.planningRolesManagement.toast.saveFailed'))
            setCapacity(String(assignment.assignedCapacity))
          }
        }}
        disabled={disabled}
      />
      <span
        className="text-muted-foreground text-xs"
        aria-hidden="true"
      >
        {t('common.unitPt')}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive size-7"
            disabled={removeMutation.isPending}
            aria-label={t('features.planningRolesManagement.actions.remove')}
            onClick={() =>
              void removeMutation.mutateAsync({
                roleId: planningRoleId,
                assignmentId: assignment.id,
              })
            }
          >
            <Trash2
              className="size-3.5"
              aria-hidden="true"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('features.planningRolesManagement.actions.remove')}</TooltipContent>
      </Tooltip>
    </div>
  )
}
