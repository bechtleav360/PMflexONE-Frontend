import { useTranslation } from 'react-i18next'

import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { useLabelManagerDialogStore } from '../../store/labelDialogStores'
import { LabelManager } from '../LabelManager/LabelManager'

interface LabelManagerDialogProps {
  scopeType: ScopeType
  scopeId: string
}

/**
 * Modal dialog wrapping the LabelManager for in-place label CRUD.
 * Opened via useLabelManagerDialogStore; scoped to the given scopeType/scopeId.
 * @param root0 - Component props.
 * @param root0.scopeType - Scope entity type for the label manager.
 * @param root0.scopeId - Scope entity ID for the label manager.
 * @returns The label manager dialog element.
 */
export function LabelManagerDialog({ scopeType, scopeId }: LabelManagerDialogProps) {
  const { t } = useTranslation()
  const { open, closeModal } = useLabelManagerDialogStore()

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeModal()
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('features.workItemLabels.managerTitle', 'Labels')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <LabelManager
            scopeType={scopeType}
            scopeId={scopeId}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
