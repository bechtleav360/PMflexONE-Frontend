import {
  addRoleToObjectMatrixHandler,
  changeObjectRolePermissionHandler,
  deleteObjectRoleHandler,
  editObjectRoleHandler,
  resetRolePermissionsHandler,
  resetTaskPermissionHandler,
} from './objectRoleMutations'
import {
  getMatricesHandler,
  getMatrixHandler,
  getRoleGroupsHandler,
  getTaskGroupsHandler,
  getUserPermissionsHandler,
} from './queryHandlers'
import {
  createRoleGroupHandler,
  deleteRoleGroupHandler,
  editRoleGroupHandler,
} from './roleGroupMutations'
import { addRoleToMatrixHandler, deleteRoleHandler, editRoleHandler } from './templateRoleMutations'

/** MSW handlers for all RASCI matrix and role management GraphQL operations. */
export const rasciMatrixHandlers = [
  getMatrixHandler,
  getRoleGroupsHandler,
  getTaskGroupsHandler,
  getUserPermissionsHandler,
  getMatricesHandler,
  changeObjectRolePermissionHandler,
  resetTaskPermissionHandler,
  resetRolePermissionsHandler,
  addRoleToObjectMatrixHandler,
  deleteObjectRoleHandler,
  editObjectRoleHandler,
  addRoleToMatrixHandler,
  editRoleHandler,
  deleteRoleHandler,
  createRoleGroupHandler,
  editRoleGroupHandler,
  deleteRoleGroupHandler,
]
