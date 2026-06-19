/**
 * Public API for the role-management feature.
 * Exports all components, hooks, and the Zustand store used by the admin UI.
 */

/** Role list grouped by role group, with Add/Edit/Delete actions. */
export * from './components/RoleList'

/** Dialog for creating or editing a role. */
export * from './components/RoleDefinitionDialog'

/** Form for role creation/editing (name, shortTitle, description, group). */
export * from './components/RoleDefinitionForm'

/** Confirmation dialog for deleting a role. */
export * from './components/DeleteRoleDialog'

/** Dialog for creating or editing a governance (role) group. */
export * from './components/GovernanceGroupDialog'

/** Form for governance group creation/editing. */
export * from './components/GovernanceGroupForm'

/** Confirmation dialog for deleting a governance group. */
export * from './components/DeleteGovernanceGroupDialog'

/** Dialog for editing a single RASCI cell in the template matrix. */
export * from './components/TemplateCellEditDialog'

/** Dialog for bulk-editing multiple RASCI cells across roles. */
export * from './components/BulkCellEditDialog'

/** Mutation hook: add a role to a matrix. */
export * from './hooks/useAddRoleToMatrix'

/** Mutation hook: edit an existing role. */
export * from './hooks/useEditRole'

/** Mutation hook: delete a role from a matrix. */
export * from './hooks/useDeleteRole'

/** Mutation hook: create a new role group. */
export * from './hooks/useAddRoleGroup'

/** Mutation hook: edit an existing role group. */
export * from './hooks/useEditRoleGroup'

/** Mutation hook: delete a role group. */
export * from './hooks/useDeleteRoleGroup'

/** Zustand store for role management dialog state. */
export * from './store/roleManagementStore'
