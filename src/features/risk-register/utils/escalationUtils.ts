/**
 * Returns the escalation chain label when present, otherwise falls back to the scope type.
 *
 * @param escalation - Object with an optional escalationChain and a scope with scopeType.
 * @returns The escalation chain label, or scopeType if the chain is absent.
 */
export function resolveEscalationTarget(escalation: {
  escalationChain?: string | null
  scope?: { scopeType: string } | null
}): string {
  return escalation.escalationChain ?? escalation.scope?.scopeType ?? ''
}
