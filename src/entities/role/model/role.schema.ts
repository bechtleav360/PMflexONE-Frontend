import { z } from 'zod'

// Backend may return internal permission keys (e.g. "WL") for system roles.
// Accept any non-empty string at the API boundary; UI restricts display values separately.
/** Zod schema for a RASCI permission key string. */
export const permissionKeySchema = z.string().min(1)

/** Zod schema for a role-task permission mapping. */
export const roleTaskPermissionSchema = z.object({
  taskId: z.string().min(1),
  permissionKey: permissionKeySchema,
})

/** Zod schema for the input to add a template-level role. */
export const addRoleInputSchema = z.object({
  matrixId: z.string().min(1),
  name: z.string().min(1),
  shortTitle: z.string().min(1).max(10),
  description: z.string().optional(),
  groupId: z.string().min(1),
  tasks: z.array(roleTaskPermissionSchema),
})

/** Zod schema for the input to add a custom role to an object matrix. */
export const addObjectRoleInputSchema = z.object({
  objectId: z.string().min(1),
  name: z.string().min(1),
  shortTitle: z.string().min(1).max(10),
  description: z.string().optional(),
  groupId: z.string().min(1),
  tasks: z.array(roleTaskPermissionSchema),
})

/** Zod schema for the input to change a single RASCI cell permission. */
export const changePermissionInputSchema = z.object({
  objectId: z.string().min(1),
  roleId: z.string().min(1),
  taskId: z.string().min(1),
  permissionKey: permissionKeySchema,
})

/** Zod schema for the input to create a new role group. */
export const createRoleGroupInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0),
  color: z.string().optional(),
})

const resourceKeyOperationsSchema = z.object({
  permissionKey: z.string(),
  operations: z.array(z.enum(['read', 'create', 'update', 'delete', 'link', 'unlink'])),
})

const taskResourceSchema = z.object({
  name: z.string(),
  operationsByKey: z.array(resourceKeyOperationsSchema),
})

const matrixTaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isFixed: z.boolean(),
  resources: z.array(taskResourceSchema),
  groupId: z.string().nullable(),
})

const matrixRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortTitle: z.string(),
  description: z.string().nullable(),
  isFixed: z.boolean(),
  isDefault: z.boolean(),
  groupId: z.string(),
  tasks: z.array(roleTaskPermissionSchema),
})

/** Zod schema for the full matrix detail response. */
export const matrixDetailSchema = z.object({
  id: z.string(),
  domainType: z.enum(['PORTFOLIO', 'PROGRAM', 'PROJECT', 'ADMIN']),
  objectId: z.string().nullable(),
  roles: z.array(matrixRoleSchema),
  tasks: z.array(matrixTaskSchema),
})

/** Zod schema for a role group entry. */
export const roleGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number(),
  color: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
})

/** Zod schema for a task group entry. */
export const taskGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number(),
})

/** Zod schema for the effective resource permissions held by a user. */
export const resourcePermissionSchema = z.object({
  resource: z.string(),
  operations: z.array(z.enum(['read', 'create', 'update', 'delete', 'link', 'unlink'])),
})

/** Inferred type for adding a template-level role. */
export type AddRoleInput = z.infer<typeof addRoleInputSchema>
/** Inferred type for adding a custom role to an object matrix. */
export type AddObjectRoleInput = z.infer<typeof addObjectRoleInputSchema>
/** Inferred type for changing a single RASCI cell permission. */
export type ChangePermissionInput = z.infer<typeof changePermissionInputSchema>
/** Inferred type for creating a new role group. */
export type CreateRoleGroupInput = z.infer<typeof createRoleGroupInputSchema>
