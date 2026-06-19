import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation DeleteProject($id: ID!) {
    deleteProject(input: { id: $id })
  }
`

/**
 * Sends the `deleteProject` GraphQL mutation to the backend.
 *
 * @param id - The ID of the project to delete.
 * @returns A promise that resolves when the project is deleted.
 */
export async function deleteProject(id: string): Promise<void> {
  await graphqlClient.request(MUTATION, { id })
}
