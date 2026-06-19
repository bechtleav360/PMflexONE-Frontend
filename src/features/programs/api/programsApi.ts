import { ClientError, gql } from 'graphql-request'
import { z } from 'zod'

/** GraphQL query document for fetching the programs list, optionally filtered by portfolio. */
export const GET_PROGRAMS = gql`
  query GetPrograms($filter: ProgramFilter) {
    programs(filter: $filter) {
      id
      version
      name
      status
      createdAt
      updatedAt
      portfolio {
        item {
          id
          name
        }
      }
      projects {
        item {
          id
        }
      }
    }
  }
`

/** GraphQL query document for fetching a single program by ID (full detail). */
export const GET_PROGRAM = gql`
  query GetProgram($id: ID!) {
    program(id: $id) {
      id
      version
      name
      status
      createdAt
      updatedAt
      metadata
      creator {
        id
        firstName
        lastName
      }
      updater {
        id
        firstName
        lastName
      }
      portfolio {
        item {
          id
          name
        }
      }
      projects {
        item {
          id
          name
          status
        }
      }
    }
  }
`

/** GraphQL query document for loading the static program status lookup table. */
export const LOOKUP_PROGRAM_STATUS = gql`
  query LookupProgramStatus {
    lookupProgramStatus {
      status
      description
      displayOrder
    }
  }
`

/** GraphQL mutation document for creating a new program. */
export const CREATE_PROGRAM = gql`
  mutation CreateProgram($input: CreateProgramInput!) {
    createProgram(input: $input) {
      id
      version
      name
      status
      createdAt
      updatedAt
      portfolio {
        item {
          id
          name
        }
      }
    }
  }
`

/** GraphQL mutation document for updating an existing program. */
export const UPDATE_PROGRAM = gql`
  mutation UpdateProgram($id: ID!, $input: UpdateProgramInput!) {
    updateProgram(id: $id, input: $input) {
      id
      version
      name
      status
      createdAt
      updatedAt
      metadata
      creator {
        id
        firstName
        lastName
      }
      updater {
        id
        firstName
        lastName
      }
      portfolio {
        item {
          id
          name
        }
      }
    }
  }
`

const programPersonSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
})

const programPortfolioItemSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const programPortfolioEdgeSchema = z.object({
  item: programPortfolioItemSchema,
})

const programProjectEdgeSchema = z.object({
  item: z.object({
    id: z.string(),
    name: z.string(),
    status: z.string().nullable(),
  }),
})

/** Zod schema for a program row returned by list queries. */
export const programListItemSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  status: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  portfolio: programPortfolioEdgeSchema.nullable().optional(),
  projects: z.array(z.object({ item: z.object({ id: z.string() }) })).optional(),
})

/** Zod schema for the full program detail returned by the single-item query and update mutation. */
export const programDetailSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  status: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.string().nullable().optional(),
  creator: programPersonSchema.nullable().optional(),
  updater: programPersonSchema.nullable().optional(),
  portfolio: programPortfolioEdgeSchema.nullable().optional(),
  projects: z.array(programProjectEdgeSchema).optional(),
})

/** Zod schema for a single entry returned by the program status lookup query. */
export const programStatusLookupSchema = z.object({
  status: z.string(),
  description: z.string().nullable(),
  displayOrder: z.number().int(),
})

/** GraphQL query document for fetching all programs belonging to a specific portfolio. */
export const GET_PORTFOLIO_PROGRAMS = gql`
  query GetPortfolioPrograms($id: ID!) {
    portfolio(id: $id) {
      programs {
        item {
          id
          version
          name
          status
          createdAt
          updatedAt
        }
      }
    }
  }
`

const portfolioProgramsEdgeSchema = z.object({
  item: programListItemSchema.omit({ portfolio: true }),
})

/** Zod schema for the top-level response of the GetPortfolioPrograms query. */
export const portfolioProgramsResponseSchema = z.object({
  portfolio: z.object({
    programs: z.array(portfolioProgramsEdgeSchema),
  }),
})

/** TanStack Query key for the programs list cache. */
export const PROGRAMS_QUERY_KEY = ['programs'] as const
// Mirrors the portfolios feature query key; used to cross-invalidate on program mutations.
/**
 * TanStack Query key factory for a portfolio's programs cache.
 *
 * @param portfolioId - The ID of the portfolio whose programs are cached.
 * @returns A stable query key array scoped to this portfolio's programs.
 */
export const PORTFOLIO_PROGRAMS_QUERY_KEY = (portfolioId: string) =>
  ['portfolios', portfolioId, 'programs'] as const
/**
 * TanStack Query key factory for a single program's detail cache.
 *
 * @param id - The program ID.
 * @returns A stable query key array scoped to this program.
 */
export const PROGRAM_QUERY_KEY = (id: string) => ['programs', id] as const
/** TanStack Query key for the program status lookup (static data, cached indefinitely). */
export const PROGRAM_STATUS_KEY = ['programs', 'status-lookup'] as const

function getGqlErrorCodes(error: unknown): string[] {
  if (!(error instanceof ClientError)) return []
  return (error.response.errors ?? [])
    .map((e) => (e.extensions?.['code'] as string | undefined) ?? '')
    .filter(Boolean)
}

/**
 * Returns `true` if the given error represents a duplicate-name conflict from the API.
 *
 * Checks both GraphQL error extension codes (`DUPLICATE_NAME`, `ALREADY_EXISTS`) and
 * message text as a fallback for servers that do not set extension codes.
 *
 * @param error - The caught error value, typically from a `graphql-request` mutation.
 * @returns `true` when the error indicates a program with the same name already exists.
 */
export function isDuplicateNameError(error: unknown): boolean {
  if (!(error instanceof ClientError)) return false
  const codes = getGqlErrorCodes(error)
  if (codes.some((c) => c === 'DUPLICATE_NAME' || c === 'ALREADY_EXISTS')) return true
  return (error.response.errors ?? []).some(
    (e) =>
      typeof e.message === 'string' &&
      (e.message.toLowerCase().includes('already exist') ||
        e.message.toLowerCase().includes('duplicate')),
  )
}

/**
 * Returns `true` if the given error represents an optimistic-lock / version conflict from the API.
 *
 * Checks both GraphQL error extension codes (`VERSION_CONFLICT`, `OPTIMISTIC_LOCK_EXCEPTION`,
 * `CONFLICT`) and message text as a fallback.
 *
 * @param error - The caught error value, typically from a `graphql-request` mutation.
 * @returns `true` when the error indicates that the program was modified concurrently.
 */
export function isVersionConflictError(error: unknown): boolean {
  if (!(error instanceof ClientError)) return false
  const codes = getGqlErrorCodes(error)
  if (
    codes.some(
      (c) => c === 'VERSION_CONFLICT' || c === 'OPTIMISTIC_LOCK_EXCEPTION' || c === 'CONFLICT',
    )
  )
    return true
  return (error.response.errors ?? []).some(
    (e) =>
      typeof e.message === 'string' &&
      (e.message.toLowerCase().includes('version') ||
        e.message.toLowerCase().includes('conflict') ||
        e.message.toLowerCase().includes('stale')),
  )
}
