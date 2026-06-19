import { z } from 'zod'

/** Scope level of the entity holding an escalated entry. */
export type EscalationScopeType = 'Program' | 'Portfolio'

/**
 * The scope holding an escalated entry at the target level.
 *
 * @property id - Unique identifier of the scoped entity (program or portfolio).
 * @property name - Display name of the scoped entity.
 * @property scopeType - Scope level: `'Program'` or `'Portfolio'`.
 */
export interface EscalationScope {
  id: string
  name: string
  scopeType: EscalationScopeType
}

/** Zod schema for the scope object embedded in escalated entry API responses. */
export const escalationScopeSchema = z.object({
  id: z.string(),
  name: z.string(),
  scopeType: z.enum(['Program', 'Portfolio']),
})
