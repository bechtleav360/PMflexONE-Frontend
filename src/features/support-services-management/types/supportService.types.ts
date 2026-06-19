import type { z } from 'zod'

import type {
  planningRoleSchema,
  supportServiceFormValuesSchema,
  supportServiceSchema,
  supportServiceTreeNodeSchema,
} from '../api/supportServicesApi'

/** A support service record as returned by the GraphQL tree/list query. */
export type SupportService = z.infer<typeof supportServiceSchema>

/** A support service augmented with resolved `childNodes` for the tree view. */
export type SupportServiceTreeNode = z.infer<typeof supportServiceTreeNodeSchema>

/** Form values for creating or editing a support service. */
export type SupportServiceFormValues = z.infer<typeof supportServiceFormValuesSchema>

/** A planning role record as returned by the GraphQL query. */
export type PlanningRole = z.infer<typeof planningRoleSchema>
