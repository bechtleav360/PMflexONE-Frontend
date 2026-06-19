/**
 * Optional filter applied when fetching the programs list.
 *
 * @property portfolioId - Restricts results to programs belonging to the specified portfolio.
 * @property name - Substring match on program name.
 * @property status - Exact match on program status code.
 */
export interface ProgramFilter {
  portfolioId?: string
  name?: string | null
  status?: string | null
}

/** Represents a person (creator or last updater) associated with a program. */
export interface ProgramPerson {
  id: string
  firstName: string
  lastName: string
}

/** Edge type linking a program to its parent portfolio. */
export interface ProgramPortfolioEdge {
  /** The portfolio node referenced by this edge. */
  item: {
    id: string
    name: string
  }
}

/** Edge type linking a program to one of its child projects. */
export interface ProgramProjectEdge {
  /** The project node referenced by this edge. */
  item: {
    id: string
    name?: string
    status?: string | null
  }
}

/** Full representation of a program as returned by the API. */
export interface Program {
  id: string
  /** Optimistic-lock version; must be passed back on every update. */
  version: number
  name: string
  /** Current status code, e.g. `'active'`. Null while in draft state. */
  status: string | null
  createdAt: string
  updatedAt: string
  /** Arbitrary JSON metadata string, if set. */
  metadata?: string | null
  creator?: ProgramPerson | null
  updater?: ProgramPerson | null
  portfolio?: ProgramPortfolioEdge | null
  /** Projects assigned to this program; only present on detail queries. */
  projects?: ProgramProjectEdge[]
}

/** A single entry from the program status lookup table. */
export interface ProgramStatusLookup {
  /** Machine-readable status code (matches `Program.status`). */
  status: string
  description: string | null
  /** Used to sort status options in the correct display order. */
  displayOrder: number
}

/** Input payload for creating a new program. */
export interface CreateProgramInput {
  name: string
  /** Optional ID of the portfolio to assign the program to. */
  portfolioId?: string | null
  /** Optional arbitrary JSON metadata string. */
  metadata?: string | null
}

/** Input payload for updating an existing program. */
export interface UpdateProgramInput {
  /** Current version of the program; required for optimistic locking. */
  version: number
  name?: string
  status?: string
  portfolioId?: string | null
  metadata?: string | null
}

/** Enumeration of all valid program status code values. */
export const PROGRAM_STATUS = {
  DRAFT: 'draft',
  CREATED: 'created',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const

/** Union type of all valid program status string values. */
export type ProgramStatus = (typeof PROGRAM_STATUS)[keyof typeof PROGRAM_STATUS]
