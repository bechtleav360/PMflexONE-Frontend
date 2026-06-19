import { gql } from 'graphql-request'
import { z } from 'zod'

import { personOptionSchema } from './personsApi'

// re-export so existing `deliverable.types.ts` import continues to work
export { personOptionSchema }

// ─────────────────────────────────────────────────────────────────────────────
// Zod Schemas
// ─────────────────────────────────────────────────────────────────────────────

/** Schema for a minimal parent/child edge. */
const deliverableRefSchema = z.object({
  id: z.string(),
  name: z.string(),
})

/** Schema for the owner edge. */
const ownerEdgeSchema = z
  .object({
    node: personOptionSchema,
  })
  .nullable()

/** Schema for the parent edge. */
const parentEdgeSchema = z
  .object({
    node: deliverableRefSchema,
  })
  .nullable()

/** Schema for a child edge (id only — name fetched lazily). */
const childEdgeSchema = z.object({
  node: z.object({ id: z.string() }),
})

/**
 * Core deliverable schema returned by the tree and list queries.
 * Matches the fields selected in `GET_DELIVERABLE_TREE` and `GET_DELIVERABLES`.
 */
export const deliverableSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  businessId: z.string().nullable(),
  position: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  parent: parentEdgeSchema,
  children: z.array(childEdgeSchema),
  owner: ownerEdgeSchema,
})

/**
 * Extended deliverable with `description` and `otherInformation` fields for the edit modal.
 * Matches the fields selected in `GET_DELIVERABLE`.
 */
export const deliverableDetailSchema = deliverableSchema.extend({
  description: z.string().nullable(),
  otherInformation: z.string().nullable(),
})

/**
 * Client-side tree node: a deliverable augmented with resolved child nodes.
 * Populated by `buildDeliverableTree`.
 */
export const deliverableTreeNodeSchema: z.ZodType<DeliverableTreeNodeRaw> = z.lazy(() =>
  deliverableSchema.extend({
    childNodes: z.array(deliverableTreeNodeSchema),
  }),
)

/** Raw type needed for the lazy schema self-reference. */
interface DeliverableTreeNodeRaw {
  id: string
  version: number
  name: string
  businessId: string | null
  position: number
  createdAt: string
  updatedAt: string
  parent: { node: { id: string; name: string } } | null
  children: Array<{ node: { id: string } }>
  owner: { node: { id: string; firstName: string; lastName: string; userId: string | null } } | null
  childNodes: DeliverableTreeNodeRaw[]
}

/** Zod schema for the create/edit form values. */
export const deliverableFormValuesSchema = z.object({
  name: z
    .string()
    .min(1, 'features.deliverablesManagement.validation.nameRequired')
    .max(255, 'features.deliverablesManagement.validation.nameMaxLength'),
  // Text input — always a string in the form; empty string → null conversion happens in onSubmit
  businessId: z.string().max(50, 'features.deliverablesManagement.validation.businessIdMaxLength'),
  parentId: z.string().nullable().optional(),
  ownerId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  otherInformation: z.string().nullable().optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Response Schemas
// ─────────────────────────────────────────────────────────────────────────────

/** Response schema for `GetDeliverableTree`. */
export const getDeliverableTreeResponseSchema = z.object({
  deliverables: z.array(deliverableSchema),
})

/** Response schema for `GetDeliverable` (single, for modal pre-fill). */
export const getDeliverableResponseSchema = z.object({
  deliverables: z.array(deliverableDetailSchema),
})

/** Response schema for `CreateDeliverable`. */
export const createDeliverableResponseSchema = z.object({
  createDeliverable: deliverableSchema,
})

/** Response schema for `UpdateDeliverable`. */
export const updateDeliverableResponseSchema = z.object({
  updateDeliverable: deliverableSchema,
})

/** Response schema for `MoveDeliverable`. */
export const moveDeliverableResponseSchema = z.object({
  moveDeliverable: z.object({
    id: z.string(),
    version: z.number().int(),
    position: z.number().int(),
    parent: parentEdgeSchema,
  }),
})

/** Response schema for `DeleteDeliverable`. */
export const deleteDeliverableResponseSchema = z.object({
  deleteDeliverable: z.object({
    deletedDescendantCount: z.number().int(),
  }),
})

// ─────────────────────────────────────────────────────────────────────────────
// GQL Documents
// ─────────────────────────────────────────────────────────────────────────────

const DELIVERABLE_TREE_FIELDS = gql`
  fragment DeliverableTreeFields on Deliverable {
    id
    version
    name
    businessId
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
    owner {
      node {
        id
        firstName
        lastName
        userId
      }
    }
  }
`

/** Fetches all deliverables for a project — used to build the tree client-side. */
export const GET_DELIVERABLE_TREE = gql`
  ${DELIVERABLE_TREE_FIELDS}
  query GetDeliverableTree($projectId: ID!) {
    deliverables(filter: { scopeId: $projectId, scopeType: Project }) {
      ...DeliverableTreeFields
    }
  }
`

/** Fetches a single deliverable by ID — used for edit modal pre-fill. */
export const GET_DELIVERABLE = gql`
  ${DELIVERABLE_TREE_FIELDS}
  query GetDeliverable($id: ID!) {
    deliverables(filter: { ids: [$id] }) {
      ...DeliverableTreeFields
      description
      otherInformation
    }
  }
`

/** Creates a new deliverable. `scopeId` + `scopeType` replace the old `projectId` field. */
export const CREATE_DELIVERABLE = gql`
  ${DELIVERABLE_TREE_FIELDS}
  mutation CreateDeliverable($input: CreateDeliverableInput!) {
    createDeliverable(input: $input) {
      ...DeliverableTreeFields
    }
  }
`

/** Updates an existing deliverable's fields. */
export const UPDATE_DELIVERABLE = gql`
  ${DELIVERABLE_TREE_FIELDS}
  mutation UpdateDeliverable($id: ID!, $input: UpdateDeliverableInput!) {
    updateDeliverable(id: $id, input: $input) {
      ...DeliverableTreeFields
    }
  }
`

/** Moves a deliverable to a new parent and/or position. */
export const MOVE_DELIVERABLE = gql`
  mutation MoveDeliverable($id: ID!, $input: MoveDeliverableInput!) {
    moveDeliverable(id: $id, input: $input) {
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

/** Deletes a deliverable and all its descendants. */
export const DELETE_DELIVERABLE = gql`
  mutation DeleteDeliverable($id: ID!, $version: Int!) {
    deleteDeliverable(id: $id, version: $version) {
      deletedDescendantCount
    }
  }
`

// ─────────────────────────────────────────────────────────────────────────────
// Query Key Factories
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TanStack Query key for the full deliverable tree of a project.
 *
 * @param projectId - The project ID to scope the key.
 * @returns A readonly tuple used as the query key.
 */
export const DELIVERABLES_TREE_KEY = (projectId: string) =>
  ['deliverables', 'tree', projectId] as const

/**
 * TanStack Query key for a single deliverable (modal pre-fill).
 *
 * @param id - The deliverable ID.
 * @returns A readonly tuple used as the query key.
 */
export const DELIVERABLE_KEY = (id: string) => ['deliverables', id] as const
