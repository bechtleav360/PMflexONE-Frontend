import { graphql, HttpResponse } from 'msw'

import { fixtureLabels, fixturePerson, fixtureScope, fixtureWorkItems } from './workItemFixtures'

/** MSW handlers for Comment, Attachment, Label, and WorkItemLink mutations. */
export const commentAttachmentHandlers = [
  graphql.mutation('CreateComment', ({ variables }) => {
    const comment = {
      id: `comment-${Date.now()}`,
      version: 1,
      text: (variables as { input: { text: string } }).input.text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: null,
      author: fixturePerson('user-1', 'Alice', 'Smith', 'alice@test.com'),
      attachments: [],
    }
    return HttpResponse.json({ data: { createComment: comment } })
  }),

  graphql.mutation('UpdateComment', ({ variables }) => {
    const updated = {
      id: variables.id,
      version: (variables as { input: { version: number } }).input.version + 1,
      text: (variables as { input: { text: string } }).input.text,
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: new Date().toISOString(),
      metadata: null,
      author: fixturePerson('user-1', 'Alice', 'Smith', 'alice@test.com'),
      attachments: [],
    }
    return HttpResponse.json({ data: { updateComment: updated } })
  }),

  graphql.mutation('DeleteComment', () => HttpResponse.json({ data: { deleteComment: true } })),

  graphql.mutation('CreateAttachment', ({ variables }) => {
    const { workItemId } = variables as { workItemId: string }
    const attachment = {
      id: `att-${Date.now()}`,
      version: 1,
      fileName: 'uploaded-file.pdf',
      storageKey: `uploads/${workItemId}/file.pdf`,
      size: 1024,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: null,
      creator: fixturePerson('user-1', 'Alice', 'Smith', 'alice@test.com'),
    }
    return HttpResponse.json({ data: { createAttachment: attachment } })
  }),

  graphql.mutation('DeleteAttachment', () =>
    HttpResponse.json({ data: { deleteAttachment: true } }),
  ),

  graphql.mutation('CreateWorkItemLink', ({ variables }) => {
    const { input } = variables as {
      input: { fromWorkItemId: string; toWorkItemId: string; linkType: string }
    }
    const source = fixtureWorkItems.find((i) => i.id === input.fromWorkItemId)
    const target = fixtureWorkItems.find((i) => i.id === input.toWorkItemId)
    if (!target)
      return HttpResponse.json(
        { errors: [{ message: 'Target work item not found' }] },
        { status: 404 },
      )
    if (source) {
      source.links.push({ edgeTypeName: input.linkType, metadata: null, item: target })
      source.version += 1
    }
    return HttpResponse.json({
      data: { createWorkItemLink: { edgeTypeName: input.linkType, metadata: null, item: target } },
    })
  }),

  graphql.mutation('DeleteWorkItemLink', () =>
    HttpResponse.json({ data: { deleteWorkItemLink: true } }),
  ),

  graphql.mutation('CreateLabel', ({ variables }) => {
    const { input } = variables as { input: { name: string; color: string; scopeId: string } }
    const label = {
      id: `label-${Date.now()}`,
      version: 1,
      name: input.name,
      color: input.color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: null,
      creator: null,
      updater: null,
      scope: fixtureScope,
    }
    return HttpResponse.json({ data: { createLabel: label } })
  }),

  graphql.mutation('UpdateLabel', ({ variables }) => {
    const input = (variables as { input: { version: number; name?: string; color?: string } }).input
    const label = fixtureLabels.find((l) => l.id === variables.id) ?? fixtureLabels[0]
    return HttpResponse.json({
      data: {
        updateLabel: {
          ...label,
          version: input.version + 1,
          name: input.name ?? label.name,
          color: input.color ?? label.color,
        },
      },
    })
  }),

  graphql.mutation('DeleteLabel', () => HttpResponse.json({ data: { deleteLabel: true } })),

  graphql.mutation('AddLabelToWorkItem', ({ variables }) => {
    const item = fixtureWorkItems.find((i) => i.id === variables.workItemId) ?? fixtureWorkItems[0]
    return HttpResponse.json({
      data: { addLabelToWorkItem: { id: item.id, version: item.version + 1, labels: item.labels } },
    })
  }),

  graphql.mutation('RemoveLabelFromWorkItem', ({ variables }) => {
    const item = fixtureWorkItems.find((i) => i.id === variables.workItemId) ?? fixtureWorkItems[0]
    return HttpResponse.json({
      data: { removeLabelFromWorkItem: { id: item.id, version: item.version + 1, labels: [] } },
    })
  }),
]
