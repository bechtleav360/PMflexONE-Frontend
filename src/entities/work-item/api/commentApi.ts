import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { Comment } from '../types/workItem.types'
import { COMMENTS_QUERY_KEY } from './queryKeys'
import { personSchema } from './workItemApi'

export { COMMENTS_QUERY_KEY }

// ─── GQL document ────────────────────────────────────────────────────────────

/** GraphQL query document for fetching all comments for a work item. */
export const GET_COMMENTS = /* GraphQL */ `
  query Comments($workItemId: ID!) {
    comments(filter: { workItemId: $workItemId }) {
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

// ─── Zod schemas ─────────────────────────────────────────────────────────────

/** Zod schema for a comment attachment. */
export const attachmentSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  fileName: z.string(),
  storageKey: z.string(),
  size: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  creator: personSchema.nullable(),
})

/** Zod schema for a work item comment including its attachments. */
export const commentSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  text: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.string().nullable(),
  creator: personSchema,
  attachments: z.array(attachmentSchema),
})

/** Zod schema for the `getComments` query response envelope. */
export const getCommentsResponseSchema = z.object({
  comments: z.array(commentSchema),
})

// ─── API function ─────────────────────────────────────────────────────────────

/**
 * Fetches all comments for a work item.
 * @param workItemId - The work item ID.
 * @returns A promise resolving to the comments array.
 */
export async function getComments(workItemId: string): Promise<Comment[]> {
  const raw = await graphqlClient.request(GET_COMMENTS, { workItemId })
  const parsed = getCommentsResponseSchema.parse(raw)
  return parsed.comments
}
