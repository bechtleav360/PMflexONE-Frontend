import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation DeleteProjectInitiationRequest($id: ID!) {
    deleteProjectInitiationRequest(input: { id: $id })
  }
`

/**
 * Sends the `deleteProjectInitiationRequest` GraphQL mutation to the backend.
 *
 * @param id - The ID of the project initiation request to delete.
 * @returns A promise that resolves when the request is deleted.
 */
export async function deleteProjectInitiationRequest(id: string): Promise<void> {
  await graphqlClient.request(MUTATION, { id })
}
