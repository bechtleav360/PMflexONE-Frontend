import type { EscalationScopeType } from '@/shared/types/escalation'

/**
 * Returns the display string for the escalation source column.
 * When a chain is present it is returned verbatim; otherwise falls back to
 * "{scopeType} {scopeName}" to identify the direct source scope.
 *
 * @param escalationChain - The pre-built upstream chain string, or null.
 * @param scopeType - The scope type of the escalated entry's holder.
 * @param scopeName - The human-readable name of the holder scope.
 * @returns The chain string if present, or a fallback "{scopeType} {scopeName}" label.
 */
export function formatEscalationChain(
  escalationChain: string | null,
  scopeType: EscalationScopeType,
  scopeName: string,
): string {
  if (escalationChain !== null) {
    return escalationChain
  }
  return `${scopeType} ${scopeName}`
}
