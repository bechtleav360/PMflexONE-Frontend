import { boardHandlers } from './boardHandlers'
import { commentAttachmentHandlers } from './commentAttachmentHandlers'
import { workItemCrudHandlers } from './workItemCrudHandlers'

/** MSW request handlers for all work-item GraphQL operations. */
export const workItemHandlers = [
  ...workItemCrudHandlers,
  ...boardHandlers,
  ...commentAttachmentHandlers,
]
