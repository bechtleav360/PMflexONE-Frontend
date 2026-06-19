/** GraphQL mutation document for creating a board with its initial columns. */
export const CREATE_BOARD = /* GraphQL */ `
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      id
      version
      name
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
      scope {
        id
        name
      }
    }
  }
`

/** GraphQL mutation document for updating board metadata. */
export const UPDATE_BOARD = /* GraphQL */ `
  mutation UpdateBoard($id: ID!, $input: UpdateBoardInput!) {
    updateBoard(id: $id, input: $input) {
      id
      version
      name
      createdAt
      updatedAt
      columns {
        id
        version
        name
        workItemStatus
        position
        workItems {
          id
          version
          name
          status
          archived
        }
      }
    }
  }
`

/** GraphQL mutation document for deleting a board by ID. */
export const DELETE_BOARD = /* GraphQL */ `
  mutation DeleteBoard($id: ID!) {
    deleteBoard(id: $id)
  }
`

/** GraphQL mutation document for creating a column on an existing board. */
export const CREATE_BOARD_COLUMN = /* GraphQL */ `
  mutation CreateBoardColumn($boardId: ID!, $input: CreateBoardColumnInput!) {
    createBoardColumn(boardId: $boardId, input: $input) {
      id
      version
      name
      workItemStatus
      position
      workItems {
        id
        version
        name
        status
        archived
      }
    }
  }
`

/** GraphQL mutation document for updating a board column's properties. */
export const UPDATE_BOARD_COLUMN = /* GraphQL */ `
  mutation UpdateBoardColumn($id: ID!, $input: UpdateBoardColumnInput!) {
    updateBoardColumn(id: $id, input: $input) {
      id
      version
      name
      workItemStatus
      position
      workItems {
        id
        version
        name
        status
        archived
      }
    }
  }
`

/** GraphQL mutation document for deleting a board column by ID. */
export const DELETE_BOARD_COLUMN = /* GraphQL */ `
  mutation DeleteBoardColumn($id: ID!) {
    deleteBoardColumn(id: $id)
  }
`

/** GraphQL mutation document for reordering the columns of a board. */
export const REORDER_BOARD_COLUMNS = /* GraphQL */ `
  mutation ReorderBoardColumns($boardId: ID!, $columnIds: [ID!]!) {
    reorderBoardColumns(boardId: $boardId, columnIds: $columnIds) {
      id
      version
      columns {
        id
        version
        name
        workItemStatus
        position
        workItems {
          id
          version
          name
          status
          archived
        }
      }
    }
  }
`

/** GraphQL mutation document for assigning a work item to a board column. */
export const ASSIGN_WORK_ITEM_TO_COLUMN = /* GraphQL */ `
  mutation AssignWorkItemToColumn($workItemId: ID!, $boardColumnId: ID!, $version: Int!) {
    assignWorkItemToColumn(
      workItemId: $workItemId
      boardColumnId: $boardColumnId
      version: $version
    ) {
      id
      version
      status
    }
  }
`

/** GraphQL mutation document for removing a work item from its board column. */
export const REMOVE_WORK_ITEM_FROM_COLUMN = /* GraphQL */ `
  mutation RemoveWorkItemFromColumn($workItemId: ID!, $version: Int!) {
    removeWorkItemFromColumn(workItemId: $workItemId, version: $version) {
      id
      version
      status
    }
  }
`

/** GraphQL mutation document for moving a work item within/between columns or to/from the pool. */
export const MOVE_WORK_ITEM = /* GraphQL */ `
  mutation MoveWorkItem($workItemId: ID!, $input: MoveWorkItemInput!) {
    moveWorkItem(workItemId: $workItemId, input: $input) {
      movedWorkItem {
        id
        version
        status
        position
        boardColumn {
          id
          version
          name
          workItemStatus
          position
        }
      }
      targetColumn {
        id
        version
      }
      sourceColumn {
        id
        version
      }
    }
  }
`
