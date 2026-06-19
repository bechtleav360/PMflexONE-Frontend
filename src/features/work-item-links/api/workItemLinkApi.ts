import { z } from 'zod'

import type { CreateWorkItemLinkInput } from '@/entities/work-item'
import { workItemBaseSchema } from '@/entities/work-item'
import { graphqlClient } from '@/shared/lib/graphqlClient'

// ─── GQL documents ────────────────────────────────────────────────────────────

/** GraphQL mutation for creating a typed link between two work items. */
export const CREATE_WORK_ITEM_LINK = /* GraphQL */ `
  mutation CreateWorkItemLink($input: CreateWorkItemLinkInput!) {
    createWorkItemLink(input: $input) {
      edgeTypeName
      metadata
      item {
        id
        version
        name
        description
        status
        dueDate
        priority
        archived
        createdAt
        updatedAt
        metadata
        creator {
          id
          firstName
          lastName
          mail
        }
        updater {
          id
          firstName
          lastName
          mail
        }
        assignee {
          id
          firstName
          lastName
          mail
        }
        boardColumn {
          id
          version
          name
          workItemStatus
          position
          board {
            id
            name
          }
        }
        labels {
          id
          version
          name
          color
        }
        scope {
          id
          name
        }
      }
    }
  }
`

/** GraphQL mutation for deleting a work item link by ID. */
export const DELETE_WORK_ITEM_LINK = /* GraphQL */ `
  mutation DeleteWorkItemLink($id: ID!) {
    deleteWorkItemLink(id: $id)
  }
`

// ─── Zod schemas ──────────────────────────────────────────────────────────────

/** Zod schema for a work item link node (edgeTypeName, metadata, item). */
export const workItemLinkSchema = z.object({
  edgeTypeName: z.string().nullable(),
  metadata: z.string().nullable(),
  item: workItemBaseSchema.nullable(),
})

const createWorkItemLinkResponseSchema = z.object({
  createWorkItemLink: workItemLinkSchema,
})

const deleteWorkItemLinkResponseSchema = z.object({
  deleteWorkItemLink: z.boolean(),
})

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Creates a typed link between two work items.
 * @param input - Link creation input.
 * @returns The created work item link node.
 */
export async function createWorkItemLink(input: CreateWorkItemLinkInput) {
  const raw = await graphqlClient.request(CREATE_WORK_ITEM_LINK, { input })
  return createWorkItemLinkResponseSchema.parse(raw).createWorkItemLink
}

/**
 * Deletes a work item link by ID.
 * @param id - Link ID.
 * @returns True if deletion succeeded.
 */
export async function deleteWorkItemLink(id: string): Promise<boolean> {
  const raw = await graphqlClient.request(DELETE_WORK_ITEM_LINK, { id })
  return deleteWorkItemLinkResponseSchema.parse(raw).deleteWorkItemLink
}
