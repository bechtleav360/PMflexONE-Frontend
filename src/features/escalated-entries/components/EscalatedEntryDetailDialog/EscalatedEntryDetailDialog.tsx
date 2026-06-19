import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/Dialog'

import { useEscalatedEntryDetailStore } from '../../store/useEscalatedEntryDetailStore'
import { EscalatedEntryDetailContent } from './EscalatedEntryDetailContent'

/**
 * Dialog that displays the full escalated-entry detail view.
 * Controlled by `useEscalatedEntryDetailStore`.
 * `showMeasures` is determined at the page layer and passed via the store.
 *
 * @returns The escalated-entry detail dialog (always mounted; controlled by store).
 */
export function EscalatedEntryDetailDialog() {
  const { t } = useTranslation()
  const { isOpen, selectedId, showMeasures, close } = useEscalatedEntryDetailStore()

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
    >
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{t('features.escalatedEntries.detail.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {selectedId && (
            <EscalatedEntryDetailContent
              id={selectedId}
              showMeasures={showMeasures}
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
