import {
  DeEscalateEntryDialog,
  EscalatedEntryDetailDialog,
  EscalateEntryDialog,
} from '@/features/escalated-entries'

/**
 * Mounts the three escalation dialogs (escalate, de-escalate, detail) once at the
 * layout level. All dialogs are driven by Zustand stores and are invisible until
 * triggered, so a single instance covers every management page.
 * @returns A fragment containing the three escalation dialog components.
 */
export function EscalationDialogProvider() {
  return (
    <>
      <EscalateEntryDialog />
      <DeEscalateEntryDialog />
      <EscalatedEntryDetailDialog />
    </>
  )
}
