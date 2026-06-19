/** GraphQL mutation document for creating a project work item. */
export const CREATE_PROJECT_WORK_ITEM = /* GraphQL */ `
  mutation CreateProjectWorkItem($input: CreateProjectWorkItemInput!) {
    createProjectWorkItem(input: $input) {
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

/** GraphQL mutation document for deleting a project work item by ID. */
export const DELETE_PROJECT_WORK_ITEM = /* GraphQL */ `
  mutation DeleteProjectWorkItem($id: ID!) {
    deleteProjectWorkItem(id: $id)
  }
`

/** GraphQL mutation document for archiving a work item. */
export const ARCHIVE_WORK_ITEM = /* GraphQL */ `
  mutation ArchiveWorkItem($id: ID!, $version: Int!) {
    archiveWorkItem(id: $id, version: $version) {
      id
      version
      archived
    }
  }
`

/** GraphQL mutation document for unarchiving a work item. */
export const UNARCHIVE_WORK_ITEM = /* GraphQL */ `
  mutation UnarchiveWorkItem($id: ID!, $version: Int!) {
    unarchiveWorkItem(id: $id, version: $version) {
      id
      version
      archived
    }
  }
`
