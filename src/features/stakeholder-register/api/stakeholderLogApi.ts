import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

// ---------------------------------------------------------------------------
// Shared response schema
// ---------------------------------------------------------------------------

const stakeholderLogResponseSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  date: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ---------------------------------------------------------------------------
// createStakeholderLog
// ---------------------------------------------------------------------------

const CREATE_LOG_MUTATION = /* GraphQL */ `
  mutation CreateStakeholderLog($stakeholderEntryId: ID!, $input: CreateStakeholderLogInput!) {
    createStakeholderLog(stakeholderEntryId: $stakeholderEntryId, input: $input) {
      id
      version
      date
      content
      createdAt
      updatedAt
    }
  }
`

/**
 * Sends the `CreateStakeholderLog` mutation and returns the created log entry.
 *
 * @param stakeholderEntryId - The ID of the parent stakeholder entry.
 * @param input - The date and content for the new log.
 * @returns The validated stakeholder log returned by the API.
 */
export async function createStakeholderLog(
  stakeholderEntryId: string,
  input: { date: string; content: string },
) {
  const raw = await graphqlClient.request(CREATE_LOG_MUTATION, { stakeholderEntryId, input })
  const parsed = z.object({ createStakeholderLog: stakeholderLogResponseSchema }).parse(raw)
  return parsed.createStakeholderLog
}

// ---------------------------------------------------------------------------
// updateStakeholderLog
// ---------------------------------------------------------------------------

const UPDATE_LOG_MUTATION = /* GraphQL */ `
  mutation UpdateStakeholderLog($id: ID!, $version: Int!, $input: UpdateStakeholderLogInput!) {
    updateStakeholderLog(id: $id, version: $version, input: $input) {
      id
      version
      date
      content
      createdAt
      updatedAt
    }
  }
`

/**
 * Sends the `UpdateStakeholderLog` mutation and returns the updated log entry.
 *
 * @param id - The ID of the log entry to update.
 * @param version - The current version for optimistic locking.
 * @param input - Partial fields to update (date, content).
 * @returns The validated stakeholder log returned by the API.
 */
export async function updateStakeholderLog(
  id: string,
  version: number,
  input: { date?: string; content?: string },
) {
  const raw = await graphqlClient.request(UPDATE_LOG_MUTATION, { id, version, input })
  const parsed = z.object({ updateStakeholderLog: stakeholderLogResponseSchema }).parse(raw)
  return parsed.updateStakeholderLog
}

// ---------------------------------------------------------------------------
// deleteStakeholderLog
// ---------------------------------------------------------------------------

const DELETE_LOG_MUTATION = /* GraphQL */ `
  mutation DeleteStakeholderLog($id: ID!, $version: Int!) {
    deleteStakeholderLog(id: $id, version: $version)
  }
`

/**
 * Sends the `DeleteStakeholderLog` mutation.
 *
 * @param id - The ID of the log entry to delete.
 * @param version - The current version for optimistic locking.
 * @returns `true` when the deletion was successful.
 */
export async function deleteStakeholderLog(id: string, version: number) {
  const raw = await graphqlClient.request(DELETE_LOG_MUTATION, { id, version })
  const parsed = z.object({ deleteStakeholderLog: z.boolean() }).parse(raw)
  return parsed.deleteStakeholderLog
}
