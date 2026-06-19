/** All valid scope context values sent to the GraphQL API. */
export const SCOPE_TYPES = ['Project', 'Program', 'Portfolio'] as const

/** Discriminates which domain entity owns a scoped resource. */
export type ScopeType = (typeof SCOPE_TYPES)[number]
