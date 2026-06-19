/** GraphQL mutation document for updating a project work item. */
export const UPDATE_PROJECT_WORK_ITEM = /* GraphQL */ `
  mutation UpdateProjectWorkItem($id: ID!, $input: UpdateProjectWorkItemInput!) {
    updateProjectWorkItem(id: $id, input: $input) {
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
      labels {
        id
        version
        name
        color
      }
      boardColumn {
        id
        version
        name
        workItemStatus
        position
      }
      scope {
        id
        name
      }
    }
  }
`
