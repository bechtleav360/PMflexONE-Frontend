import { z } from 'zod'

import { labelSchema } from '@/entities/work-item'
import { graphqlClient } from '@/shared/lib/graphqlClient'

// ─── GQL documents ────────────────────────────────────────────────────────────

const LABEL_FIELDS = /* GraphQL */ `
  id
  version
  name
  color
  createdAt
  updatedAt
  metadata
  creator { id firstName lastName mail }
  updater { id firstName lastName mail }
  scope { id name }
`

/** GraphQL mutation for creating a label in a scope. */
export const CREATE_LABEL = /* GraphQL */ `
  mutation CreateLabel($input: CreateLabelInput!) {
    createLabel(input: $input) { ${LABEL_FIELDS} }
  }
`

/** GraphQL mutation for updating a label's name or color. */
export const UPDATE_LABEL = /* GraphQL */ `
  mutation UpdateLabel($id: ID!, $input: UpdateLabelInput!) {
    updateLabel(id: $id, input: $input) { ${LABEL_FIELDS} }
  }
`

/** GraphQL mutation for deleting a label by ID. */
export const DELETE_LABEL = /* GraphQL */ `
  mutation DeleteLabel($id: ID!) {
    deleteLabel(id: $id)
  }
`

/** GraphQL mutation for adding a label to a work item. */
export const ADD_LABEL_TO_WORK_ITEM = /* GraphQL */ `
  mutation AddLabelToWorkItem($workItemId: ID!, $labelId: ID!) {
    addLabelToWorkItem(workItemId: $workItemId, labelId: $labelId) {
      id
      version
      labels {
        id
        version
        name
        color
      }
    }
  }
`

/** GraphQL mutation for removing a label from a work item. */
export const REMOVE_LABEL_FROM_WORK_ITEM = /* GraphQL */ `
  mutation RemoveLabelFromWorkItem($workItemId: ID!, $labelId: ID!) {
    removeLabelFromWorkItem(workItemId: $workItemId, labelId: $labelId) {
      id
      version
      labels {
        id
        version
        name
        color
      }
    }
  }
`

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const createLabelResponseSchema = z.object({ createLabel: labelSchema })
const updateLabelResponseSchema = z.object({ updateLabel: labelSchema })
const deleteLabelResponseSchema = z.object({ deleteLabel: z.boolean() })

const labelRefSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  color: z.string(),
})
const workItemWithLabelsSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  labels: z.array(labelRefSchema),
})
const addLabelResponseSchema = z.object({ addLabelToWorkItem: workItemWithLabelsSchema })
const removeLabelResponseSchema = z.object({ removeLabelFromWorkItem: workItemWithLabelsSchema })

// ─── API functions ────────────────────────────────────────────────────────────

/** Arguments for the createLabel API function. */
export interface CreateLabelArgs {
  scopeId: string
  scopeType: string
  name: string
  color: string
}

/** Arguments for the updateLabel API function. */
export interface UpdateLabelArgs {
  id: string
  version: number
  name?: string
  color?: string
}

/**
 * Creates a new label in a scope.
 * @param args - Label creation arguments.
 * @returns The created label node.
 */
export async function createLabel(args: CreateLabelArgs) {
  const raw = await graphqlClient.request(CREATE_LABEL, { input: args })
  return createLabelResponseSchema.parse(raw).createLabel
}

/**
 * Updates an existing label's name or color.
 * @param args - Label update arguments including ID.
 * @param args.id - Label ID.
 * @returns The updated label node.
 */
export async function updateLabel({ id, ...input }: UpdateLabelArgs) {
  const raw = await graphqlClient.request(UPDATE_LABEL, { id, input })
  return updateLabelResponseSchema.parse(raw).updateLabel
}

/**
 * Deletes a label by ID.
 * @param id - Label ID.
 * @returns True if deletion succeeded.
 */
export async function deleteLabel(id: string): Promise<boolean> {
  const raw = await graphqlClient.request(DELETE_LABEL, { id })
  return deleteLabelResponseSchema.parse(raw).deleteLabel
}

/**
 * Adds a label to a work item.
 * @param workItemId - Work item ID.
 * @param labelId - Label ID.
 * @returns The updated work item with labels.
 */
export async function addLabelToWorkItem(workItemId: string, labelId: string) {
  const raw = await graphqlClient.request(ADD_LABEL_TO_WORK_ITEM, { workItemId, labelId })
  return addLabelResponseSchema.parse(raw).addLabelToWorkItem
}

/**
 * Removes a label from a work item.
 * @param workItemId - Work item ID.
 * @param labelId - Label ID.
 * @returns The updated work item with labels.
 */
export async function removeLabelFromWorkItem(workItemId: string, labelId: string) {
  const raw = await graphqlClient.request(REMOVE_LABEL_FROM_WORK_ITEM, { workItemId, labelId })
  return removeLabelResponseSchema.parse(raw).removeLabelFromWorkItem
}
