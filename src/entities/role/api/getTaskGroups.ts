import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { taskGroupSchema } from '../model/role.schema'
import type { TaskGroup } from '../model/role.types'

const QUERY = /* GraphQL */ `
  query GetTaskGroups {
    taskGroups {
      id
      name
      description
      sortOrder
    }
  }
`

const responseSchema = z.object({
  taskGroups: z.array(taskGroupSchema),
})

/**
 * Fetches all task groups from the backend.
 * The response is validated with Zod at the API boundary.
 *
 * @returns A promise resolving to the array of task groups.
 */
export async function getTaskGroups(): Promise<TaskGroup[]> {
  const raw = await graphqlClient.request(QUERY)
  const parsed = responseSchema.parse(raw)
  return parsed.taskGroups
}
