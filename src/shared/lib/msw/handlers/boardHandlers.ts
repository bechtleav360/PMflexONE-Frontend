import { graphql, HttpResponse } from 'msw'

import { fixtureBoard, fixtureScope, fixtureWorkItems, recordChange } from './workItemFixtures'

/** MSW handlers for Board and BoardColumn mutations. */
export const boardHandlers = [
  graphql.query('Boards', () => HttpResponse.json({ data: { boards: [fixtureBoard] } })),
  graphql.query('Board', ({ variables }) =>
    HttpResponse.json({ data: { board: variables.id === fixtureBoard.id ? fixtureBoard : null } }),
  ),

  graphql.mutation('CreateBoard', ({ variables }) => {
    const input = variables.input as Record<string, unknown>
    const newBoard = {
      ...fixtureBoard,
      id: `board-${Date.now()}`,
      version: 1,
      name: String(input.name ?? 'New Board'),
      scope: fixtureScope,
      columns: (input.columns as Array<Record<string, unknown>>).map((c, i) => ({
        id: `col-new-${i}`,
        version: 1,
        name: String(c.name),
        workItemStatus: String(c.workItemStatus),
        position: i,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        board: { id: `board-${Date.now()}`, name: String(input.name) },
        workItems: [],
      })),
    }
    return HttpResponse.json({ data: { createBoard: newBoard } })
  }),

  graphql.mutation('UpdateBoard', ({ variables }) => {
    if (variables.id === fixtureBoard.id) {
      const input = variables.input as Record<string, unknown>
      if (input.name) fixtureBoard.name = String(input.name)
      fixtureBoard.version += 1
    }
    return HttpResponse.json({ data: { updateBoard: fixtureBoard } })
  }),

  graphql.mutation('DeleteBoard', () => HttpResponse.json({ data: { deleteBoard: true } })),

  graphql.mutation('CreateBoardColumn', ({ variables }) => {
    const input = variables.input as Record<string, unknown>
    const newCol = {
      id: `col-${Date.now()}`,
      version: 1,
      name: String(input.name),
      workItemStatus: String(input.workItemStatus),
      position: Number(input.position ?? 0),
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      board: { id: fixtureBoard.id, name: fixtureBoard.name },
      workItems: [] as never[],
    }
    fixtureBoard.columns.push(newCol)
    return HttpResponse.json({ data: { createBoardColumn: newCol } })
  }),

  graphql.mutation('UpdateBoardColumn', ({ variables }) => {
    const col = fixtureBoard.columns.find((c) => c.id === variables.id)
    if (!col) return HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 404 })
    const input = variables.input as Record<string, unknown>
    if (input.name) col.name = String(input.name)
    col.version += 1
    return HttpResponse.json({ data: { updateBoardColumn: col } })
  }),

  graphql.mutation('DeleteBoardColumn', () =>
    HttpResponse.json({ data: { deleteBoardColumn: true } }),
  ),

  graphql.mutation('ReorderBoardColumns', ({ variables }) => {
    const columnIds = variables.columnIds as string[]
    fixtureBoard.columns.sort((a, b) => columnIds.indexOf(a.id) - columnIds.indexOf(b.id))
    fixtureBoard.columns.forEach((c, i) => {
      c.position = i
    })
    return HttpResponse.json({ data: { reorderBoardColumns: fixtureBoard } })
  }),

  graphql.mutation('MoveWorkItem', ({ variables }) => {
    const { workItemId, input } = variables as {
      workItemId: string
      input: { version: number; targetColumnId?: string | null; afterWorkItemId?: string | null }
    }
    const item = fixtureWorkItems.find((i) => i.id === workItemId)
    if (!item) return HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 404 })

    const targetCol = input.targetColumnId
      ? fixtureBoard.columns.find((c) => c.id === input.targetColumnId)
      : null
    const sourceCol = fixtureBoard.columns.find((c) =>
      c.workItems.some((wi: unknown) => (wi as { id: string }).id === workItemId),
    )

    if (targetCol) {
      const newStatus = targetCol.workItemStatus.toUpperCase()
      if (item.status !== newStatus) {
        recordChange(workItemId, 'status', item.status, newStatus)
        item.status = newStatus
      }
    }
    item.version += 1

    for (const c of fixtureBoard.columns) {
      c.workItems = c.workItems.filter((wi: unknown) => (wi as { id: string }).id !== workItemId)
    }
    if (targetCol) {
      targetCol.workItems = [...targetCol.workItems, item as never] as never[]
      const { workItems: _wi, ...colWithoutItems } = targetCol
      item.boardColumn = colWithoutItems
    } else {
      item.boardColumn = null
    }

    return HttpResponse.json({
      data: {
        moveWorkItem: {
          movedWorkItem: {
            id: item.id,
            version: item.version,
            status: item.status,
            position: 0,
            boardColumn: item.boardColumn,
          },
          targetColumn: targetCol ? { id: targetCol.id, version: targetCol.version } : null,
          sourceColumn: sourceCol ? { id: sourceCol.id, version: sourceCol.version } : null,
        },
      },
    })
  }),

  graphql.mutation('AssignWorkItemToColumn', ({ variables }) => {
    const col = fixtureBoard.columns.find((c) => c.id === variables.boardColumnId)
    const item = fixtureWorkItems.find((i) => i.id === variables.workItemId)
    if (!col || !item)
      return HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 404 })
    const newStatus = col.workItemStatus.toUpperCase()
    if (item.status !== newStatus) {
      recordChange(String(variables.workItemId), 'status', item.status, newStatus)
    }
    item.version += 1
    item.status = newStatus
    for (const c of fixtureBoard.columns) {
      c.workItems = c.workItems.filter((wi: unknown) => (wi as { id: string }).id !== item.id)
    }
    col.workItems = [...col.workItems, item as never] as never[]
    const { workItems: _wi, ...colWithoutItems } = col
    item.boardColumn = colWithoutItems
    return HttpResponse.json({
      data: {
        assignWorkItemToColumn: {
          id: item.id,
          version: item.version,
          status: item.status,
          boardColumn: colWithoutItems,
        },
      },
    })
  }),

  graphql.mutation('RemoveWorkItemFromColumn', ({ variables }) => {
    const item = fixtureWorkItems.find((i) => i.id === variables.workItemId)
    if (!item) return HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 404 })
    item.version += 1
    return HttpResponse.json({
      data: {
        removeWorkItemFromColumn: {
          id: item.id,
          version: item.version,
          status: item.status,
          boardColumn: null,
        },
      },
    })
  }),
]
