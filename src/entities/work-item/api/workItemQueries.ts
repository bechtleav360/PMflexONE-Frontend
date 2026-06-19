const WORK_ITEM_FIELDS = /* GraphQL */ `
  fragment WorkItemFields on WorkItem {
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
    boardColumn {
      id
      version
      name
      workItemStatus
      position
      board {
        id
        name
      }
    }
    labels {
      id
      version
      name
      color
    }
    scope {
      id
      name
    }
    position
  }
`

/** GraphQL query document for fetching a filtered list of work items. */
export const GET_WORK_ITEMS = /* GraphQL */ `
  ${WORK_ITEM_FIELDS}
  query WorkItems($filter: WorkItemFilter) {
    workItems(filter: $filter) {
      ...WorkItemFields
    }
  }
`

/** GraphQL query document for fetching a single work item by ID, including comments and links (no attachments). */
export const GET_WORK_ITEM = /* GraphQL */ `
  ${WORK_ITEM_FIELDS}
  query WorkItem($id: ID!) {
    workItem(id: $id) {
      ...WorkItemFields
      comments {
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
      links {
        edgeTypeName
        metadata
        item {
          ...WorkItemFields
        }
      }
    }
  }
`

/**
 * GraphQL query document for fetching only the attachments of a single work item.
 * Kept separate so that attachment enrichment errors (NullValueInNonNullableField) cannot
 * null-propagate into the main work-item query and blank the entire detail panel.
 */
export const GET_WORK_ITEM_ATTACHMENTS = /* GraphQL */ `
  query WorkItemAttachments($id: ID!) {
    workItem(id: $id) {
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

/**
 * Safe fallback query that omits the non-null-in-schema but potentially-null-in-DB fields
 * (fileName, storageKey, size). Includes `metadata` so the frontend can recover the fileName
 * stored there at upload time, and derives storageKey from the attachment ID — both without
 * depending on backend enrichment.
 */
export const GET_WORK_ITEM_ATTACHMENTS_SAFE = /* GraphQL */ `
  query WorkItemAttachmentsSafe($id: ID!) {
    workItem(id: $id) {
      attachments {
        id
        version
        metadata
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
