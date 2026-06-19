import { gql } from 'graphql-request'
import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Zod Schemas
// ─────────────────────────────────────────────────────────────────────────────

/** Schema for the assignee edge (planning role reference). */
const assigneeEdgeSchema = z
  .object({
    node: z.object({ id: z.string(), name: z.string() }),
  })
  .nullable()

/** Schema for the parent edge. */
const parentEdgeSchema = z
  .object({
    node: z.object({ id: z.string(), name: z.string() }),
  })
  .nullable()

/** Schema for a child edge (id only). */
const childEdgeSchema = z.object({
  node: z.object({ id: z.string() }),
})

/**
 * Core support service schema returned by the tree and list queries.
 * Matches the fields selected in `GET_SUPPORT_SERVICES`.
 */
export const supportServiceSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  otherInformation: z.string().nullable(),
  estimatedEffort: z.number().nullable(),
  position: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  parent: parentEdgeSchema,
  children: z.array(childEdgeSchema),
  assignee: assigneeEdgeSchema,
})

/**
 * Client-side tree node: a support service augmented with resolved child nodes.
 * Populated by `buildSupportServiceTree`.
 */
export const supportServiceTreeNodeSchema: z.ZodType<SupportServiceTreeNodeRaw> = z.lazy(() =>
  supportServiceSchema.extend({
    childNodes: z.array(supportServiceTreeNodeSchema),
  }),
)

/** Raw type needed for the lazy schema self-reference. */
interface SupportServiceTreeNodeRaw {
  id: string
  version: number
  name: string
  description: string | null
  otherInformation: string | null
  estimatedEffort: number | null
  position: number
  createdAt: string
  updatedAt: string
  parent: { node: { id: string; name: string } } | null
  children: Array<{ node: { id: string } }>
  assignee: { node: { id: string; name: string } } | null
  childNodes: SupportServiceTreeNodeRaw[]
}

/** Zod schema for a planning role user assignment. */
export const planningRoleUserAssignmentSchema = z.object({
  id: z.string(),
  person: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
    })
    .nullable(),
  assignedCapacity: z.number(),
})

/** Zod schema for a planning role. */
export const planningRoleSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  capacityPerWeek: z.number(),
  assigned: z.number(),
  unassigned: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  userAssignments: z.array(planningRoleUserAssignmentSchema),
})

/** Zod schema for the create/edit form values. */
export const supportServiceFormValuesSchema = z.object({
  name: z
    .string()
    .min(1, 'features.supportServicesManagement.validation.nameRequired')
    .max(255, 'features.supportServicesManagement.validation.nameMaxLength'),
  parentId: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  estimatedEffort: z
    .number()
    .min(0, 'features.supportServicesManagement.validation.effortMin')
    .optional()
    .nullable(),
  description: z.string().nullable().optional(),
  otherInformation: z.string().nullable().optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Response Schemas
// ─────────────────────────────────────────────────────────────────────────────

/** Response schema for `GetSupportServices`. */
export const getSupportServicesResponseSchema = z.object({
  supportServices: z.array(supportServiceSchema),
})

/** Response schema for `CreateSupportService`. */
export const createSupportServiceResponseSchema = z.object({
  createSupportService: supportServiceSchema,
})

/** Response schema for `UpdateSupportService`. */
export const updateSupportServiceResponseSchema = z.object({
  updateSupportService: supportServiceSchema,
})

/** Response schema for `MoveSupportService`. */
export const moveSupportServiceResponseSchema = z.object({
  moveSupportService: z.object({
    id: z.string(),
    version: z.number().int(),
    position: z.number().int(),
    parent: parentEdgeSchema,
  }),
})

/** Response schema for `DeleteSupportService`. */
export const deleteSupportServiceResponseSchema = z.object({
  deleteSupportService: z.object({ deletedDescendantCount: z.number() }),
})

/** Response schema for `GetPlanningRoles`. */
export const getPlanningRolesResponseSchema = z.object({
  planningRoles: z.array(planningRoleSchema),
})

/** Response schema for `CreatePlanningRole`. */
export const createPlanningRoleResponseSchema = z.object({
  createPlanningRole: planningRoleSchema,
})

/** Response schema for `UpdatePlanningRole`. */
export const updatePlanningRoleResponseSchema = z.object({
  updatePlanningRole: planningRoleSchema,
})

// ─────────────────────────────────────────────────────────────────────────────
// GQL Documents
// ─────────────────────────────────────────────────────────────────────────────

const SUPPORT_SERVICE_FIELDS = gql`
  fragment SupportServiceFields on SupportService {
    id
    version
    name
    description
    otherInformation
    estimatedEffort
    position
    createdAt
    updatedAt
    parent {
      node {
        id
        name
      }
    }
    children {
      node {
        id
      }
    }
    assignee {
      node {
        id
        name
      }
    }
  }
`

/** Fetches all support services for a project — used to build the tree client-side. */
export const GET_SUPPORT_SERVICES = gql`
  ${SUPPORT_SERVICE_FIELDS}
  query GetSupportServices($projectId: ID!) {
    supportServices(filter: { scopeId: $projectId, scopeType: Project }) {
      ...SupportServiceFields
    }
  }
`

/** Fetches a single support service by ID — used for edit form pre-fill. */
export const GET_SUPPORT_SERVICE = gql`
  ${SUPPORT_SERVICE_FIELDS}
  query GetSupportService($id: ID!) {
    supportServices(filter: { ids: [$id] }) {
      ...SupportServiceFields
    }
  }
`

/** Creates a new support service. */
export const CREATE_SUPPORT_SERVICE = gql`
  ${SUPPORT_SERVICE_FIELDS}
  mutation CreateSupportService($input: CreateSupportServiceInput!) {
    createSupportService(input: $input) {
      ...SupportServiceFields
    }
  }
`

/** Updates an existing support service's fields. */
export const UPDATE_SUPPORT_SERVICE = gql`
  ${SUPPORT_SERVICE_FIELDS}
  mutation UpdateSupportService($id: ID!, $input: UpdateSupportServiceInput!) {
    updateSupportService(id: $id, input: $input) {
      ...SupportServiceFields
    }
  }
`

/** Moves a support service to a new parent and/or position. */
export const MOVE_SUPPORT_SERVICE = gql`
  mutation MoveSupportService($id: ID!, $version: Int!, $parentId: ID, $position: Int!) {
    moveSupportService(id: $id, version: $version, parentId: $parentId, position: $position) {
      id
      version
      position
      parent {
        node {
          id
          name
        }
      }
    }
  }
`

/** Deletes a support service using CASCADE_DELETE or PROMOTE_CHILDREN mode. */
export const DELETE_SUPPORT_SERVICE = gql`
  mutation DeleteSupportService($id: ID!, $version: Int!, $deleteMode: SupportServiceDeleteMode!) {
    deleteSupportService(id: $id, version: $version, deleteMode: $deleteMode) {
      deletedDescendantCount
    }
  }
`

// ─────────────────────────────────────────────────────────────────────────────
// Query Key Factories
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TanStack Query key for the full support service tree of a project.
 *
 * @param projectId - The project ID to scope the key.
 * @returns A readonly tuple used as the query key.
 */
export const SUPPORT_SERVICES_KEY = (projectId: string) =>
  ['supportServices', 'tree', projectId] as const

/**
 * TanStack Query key for a single support service.
 *
 * @param id - The support service ID.
 * @returns A readonly tuple used as the query key.
 */
export const SUPPORT_SERVICE_KEY = (id: string) => ['supportServices', id] as const
