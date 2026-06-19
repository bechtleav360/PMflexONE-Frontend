import { z } from 'zod'

/** The fixed set of work-item statuses every board must cover. */
export const BASE_STATUSES = ['OPEN', 'IN_PROGRESS', 'DONE'] as const
const ALL_BASE_STATUSES = BASE_STATUSES

const boardColumnFormSchema = z.object({
  name: z.string().min(1, 'Column name is required'),
  workItemStatus: z.enum(ALL_BASE_STATUSES),
  position: z.number().int().min(0),
})

/** Zod validation schema for the board create/edit form. Enforces one column per base status. */
export const boardFormSchema = z
  .object({
    name: z.string().min(1, 'Board name is required').max(255),
    columns: z.array(boardColumnFormSchema).min(1, 'At least one column is required'),
  })
  .refine(
    (data) => {
      const statuses = new Set(data.columns.map((c) => c.workItemStatus))
      return ALL_BASE_STATUSES.every((s) => statuses.has(s))
    },
    {
      message: 'Board must have at least one column for each base status: OPEN, IN_PROGRESS, DONE',
      path: ['columns'],
    },
  )

/** Inferred type for a single board column form entry. */
export type BoardColumnFormValues = z.infer<typeof boardColumnFormSchema>
/** Inferred type for validated board form data. */
export type BoardFormValues = z.infer<typeof boardFormSchema>

/** Default columns that satisfy the base-status coverage constraint. */
export const DEFAULT_BOARD_COLUMNS: BoardColumnFormValues[] = [
  { name: 'Open', workItemStatus: 'OPEN', position: 0 },
  { name: 'In Progress', workItemStatus: 'IN_PROGRESS', position: 1 },
  { name: 'Done', workItemStatus: 'DONE', position: 2 },
]
