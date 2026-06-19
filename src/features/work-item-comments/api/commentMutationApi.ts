import { z } from 'zod'

import { commentSchema } from '@/entities/work-item'
import { graphqlClient } from '@/shared/lib/graphqlClient'

// ─── GQL documents ────────────────────────────────────────────────────────────

/** GraphQL mutation for creating a comment on a work item. */
export const CREATE_COMMENT = /* GraphQL */ `
  mutation CreateComment($workItemId: ID!, $input: CreateCommentInput!) {
    createComment(workItemId: $workItemId, input: $input) {
      id
      version
      text
      createdAt
      updatedAt
      metadata
      creator {
        id
        firstName
        lastName
        mail
      }
      attachments {
        id
        version
        fileName
        storageKey
        size
        createdAt
        updatedAt
        creator {
          id
          firstName
          lastName
          mail
        }
      }
    }
  }
`

/** GraphQL mutation for updating a comment's text. */
export const UPDATE_COMMENT = /* GraphQL */ `
  mutation UpdateComment($id: ID!, $input: UpdateCommentInput!) {
    updateComment(id: $id, input: $input) {
      id
      version
      text
      createdAt
      updatedAt
      metadata
      creator {
        id
        firstName
        lastName
        mail
      }
      attachments {
        id
        version
        fileName
        storageKey
        size
        createdAt
        updatedAt
        creator {
          id
          firstName
          lastName
          mail
        }
      }
    }
  }
`

/** GraphQL mutation for deleting a comment by ID. */
export const DELETE_COMMENT = /* GraphQL */ `
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const createCommentResponseSchema = z.object({
  createComment: commentSchema,
})

const updateCommentResponseSchema = z.object({
  updateComment: commentSchema,
})

const deleteCommentResponseSchema = z.object({
  deleteComment: z.boolean(),
})

// ─── Input types ─────────────────────────────────────────────────────────────

/** Arguments for the createComment API function. */
export interface CreateCommentArgs {
  workItemId: string
  text: string
}

/** Arguments for the updateComment API function. */
export interface UpdateCommentArgs {
  id: string
  version: number
  text: string
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Creates a new comment on a work item.
 * @param args - Comment creation arguments.
 * @param args.workItemId - The work item to comment on.
 * @param args.text - Comment body text.
 * @returns The created comment node.
 */
export async function createComment({ workItemId, text }: CreateCommentArgs) {
  const raw = await graphqlClient.request(CREATE_COMMENT, {
    workItemId,
    input: { text },
  })
  return createCommentResponseSchema.parse(raw).createComment
}

/**
 * Updates the text of an existing comment.
 * @param args - Comment update arguments.
 * @param args.id - Comment ID.
 * @param args.version - Current version for optimistic concurrency.
 * @param args.text - New comment body text.
 * @returns The updated comment node.
 */
export async function updateComment({ id, version, text }: UpdateCommentArgs) {
  const raw = await graphqlClient.request(UPDATE_COMMENT, {
    id,
    input: { version, text },
  })
  return updateCommentResponseSchema.parse(raw).updateComment
}

/**
 * Deletes a comment by ID.
 * @param id - Comment ID.
 * @returns True if deletion succeeded.
 */
export async function deleteComment(id: string): Promise<boolean> {
  const raw = await graphqlClient.request(DELETE_COMMENT, { id })
  return deleteCommentResponseSchema.parse(raw).deleteComment
}
