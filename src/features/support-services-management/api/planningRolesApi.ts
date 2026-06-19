import { gql } from 'graphql-request'

const PLANNING_ROLE_FIELDS = gql`
  fragment PlanningRoleFields on PlanningRole {
    id
    version
    name
    capacityPerWeek
    assigned
    unassigned
    createdAt
    updatedAt
    userAssignments {
      id
      person {
        id
        firstName
        lastName
      }
      assignedCapacity
    }
  }
`

/** Fetches all planning roles for a project. */
export const GET_PLANNING_ROLES = gql`
  ${PLANNING_ROLE_FIELDS}
  query GetPlanningRoles($projectId: ID!) {
    planningRoles(scopeId: $projectId, scopeType: Project) {
      ...PlanningRoleFields
    }
  }
`

/** Creates a new planning role. */
export const CREATE_PLANNING_ROLE = gql`
  ${PLANNING_ROLE_FIELDS}
  mutation CreatePlanningRole($input: CreatePlanningRoleInput!) {
    createPlanningRole(input: $input) {
      ...PlanningRoleFields
    }
  }
`

/** Updates an existing planning role. */
export const UPDATE_PLANNING_ROLE = gql`
  ${PLANNING_ROLE_FIELDS}
  mutation UpdatePlanningRole($id: ID!, $input: UpdatePlanningRoleInput!) {
    updatePlanningRole(id: $id, input: $input) {
      ...PlanningRoleFields
    }
  }
`

/** Deletes a planning role. */
export const DELETE_PLANNING_ROLE = gql`
  mutation DeletePlanningRole($id: ID!, $version: Int!) {
    deletePlanningRole(id: $id, version: $version)
  }
`

/** Adds a user to a planning role. */
export const ADD_USER_TO_PLANNING_ROLE = gql`
  ${PLANNING_ROLE_FIELDS}
  mutation AddUserToPlanningRole($roleId: ID!, $userId: ID!, $assignedCapacity: Float!) {
    addUserToPlanningRole(roleId: $roleId, userId: $userId, assignedCapacity: $assignedCapacity) {
      ...PlanningRoleFields
    }
  }
`

/** Updates a user assignment on a planning role. */
export const UPDATE_PLANNING_ROLE_USER_ASSIGNMENT = gql`
  ${PLANNING_ROLE_FIELDS}
  mutation UpdatePlanningRoleUserAssignment(
    $roleId: ID!
    $assignmentId: ID!
    $assignedCapacity: Float!
  ) {
    updatePlanningRoleUserAssignment(
      roleId: $roleId
      assignmentId: $assignmentId
      assignedCapacity: $assignedCapacity
    ) {
      ...PlanningRoleFields
    }
  }
`

/** Removes a user from a planning role. */
export const REMOVE_USER_FROM_PLANNING_ROLE = gql`
  ${PLANNING_ROLE_FIELDS}
  mutation RemoveUserFromPlanningRole($roleId: ID!, $assignmentId: ID!) {
    removeUserFromPlanningRole(roleId: $roleId, assignmentId: $assignmentId) {
      ...PlanningRoleFields
    }
  }
`

/**
 * TanStack Query key for the planning roles of a project.
 *
 * @param projectId - The project ID to scope the key.
 * @returns A readonly tuple used as the query key.
 */
export const PLANNING_ROLES_KEY = (projectId: string) => ['planningRoles', projectId] as const
