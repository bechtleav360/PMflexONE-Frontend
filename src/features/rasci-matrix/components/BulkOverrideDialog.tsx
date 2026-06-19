import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import type { DomainType, PermissionKey } from '@/entities/role'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@/shared/components'

import { useChangeObjectRolePermission } from '../hooks/useChangeObjectRolePermission'
import { useRasciMatrixStore } from '../store/rasciMatrixStore'

const PERMISSION_OPTIONS: PermissionKey[] = ['R', 'A', 'S', 'C', 'I', '—']

type OverrideT = ReturnType<typeof useTranslation>['t']

function renderPermissionRadioGroup(
  selectedValue: PermissionKey,
  onValueChange: (val: PermissionKey) => void,
  idPrefix: string,
  t: OverrideT,
) {
  return (
    <RadioGroup
      value={selectedValue}
      onValueChange={(val) => onValueChange(val as PermissionKey)}
      className="space-y-1"
    >
      {PERMISSION_OPTIONS.map((key) => (
        <div
          key={key}
          className="hover:bg-muted/50 flex items-center gap-3 rounded px-2 py-1.5"
        >
          <RadioGroupItem
            value={key}
            id={`${idPrefix}-${key}`}
          />
          <Label
            htmlFor={`${idPrefix}-${key}`}
            className="flex w-full cursor-pointer items-center gap-2"
          >
            <span className="w-4 text-center font-mono font-semibold">{key}</span>
            <span className="text-muted-foreground text-xs">
              {t(`pages.roleManagement.rasciLegend.${key}`)}
            </span>
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}

interface BulkOverrideDialogProps {
  objectId: string
  domainType: DomainType
}

/**
 * Dialog for bulk-overriding multiple RASCI cells on an object matrix.
 * Fires one `changeObjectRolePermission` mutation per selected cell in parallel.
 *
 * @param root0 - Component props.
 * @param root0.objectId - The object whose matrix cells are being overridden.
 * @param root0.domainType - The domain type of the object matrix.
 * @returns The rendered bulk-override dialog element.
 */
export function BulkOverrideDialog({ objectId, domainType }: BulkOverrideDialogProps) {
  const { t } = useTranslation()
  const { isBulkOverrideOpen, bulkSelectedCells, bulkContextLabel, clearBulkSelection } =
    useRasciMatrixStore()
  const { mutateAsync, isPending } = useChangeObjectRolePermission()

  const [selectedValue, setSelectedValue] = useState<PermissionKey>('—')

  const cellCount = bulkSelectedCells.size
  const isOpen = isBulkOverrideOpen && cellCount > 0

  async function handleSubmit() {
    try {
      await Promise.all(
        Array.from(bulkSelectedCells.values()).map((cell) =>
          mutateAsync({
            objectId,
            domainType,
            roleId: cell.roleId,
            taskId: cell.taskId,
            permissionKey: selectedValue,
          }),
        ),
      )
    } finally {
      clearBulkSelection()
      setSelectedValue('—')
    }
  }

  const affectedRoleCount = new Set(Array.from(bulkSelectedCells.values()).map((c) => c.roleId))
    .size

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          clearBulkSelection()
          setSelectedValue('—')
        }
      }}
    >
      <DialogContent
        className="sm:max-w-sm"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t('pages.roleManagement.bulkEditTitle', 'Set RASCI Value')}</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {bulkContextLabel && (
            <div className="border-primary/30 bg-primary/5 rounded-md border px-3 py-2 text-sm">
              <span className="font-medium">
                {t('pages.roleManagement.taskGroupBulkContext', 'Task group:')}
              </span>{' '}
              {bulkContextLabel}
            </div>
          )}
          <p className="text-muted-foreground text-sm">
            {t('pages.roleManagement.bulkEditSummary', {
              cellCount,
              roleCount: affectedRoleCount,
              defaultValue: '{{cellCount}} cells across {{roleCount}} role(s) will be updated.',
            })}
          </p>

          {renderPermissionRadioGroup(selectedValue, setSelectedValue, 'bulk-override-perm', t)}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={clearBulkSelection}
            disabled={isPending}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            aria-disabled={isPending}
          >
            {t('common.save', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
