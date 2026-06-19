import type {
  MatrixDetail,
  MatrixRole,
  MatrixTask,
  RoleGroup,
  TaskGroup,
  TaskResource,
} from '@/entities/role'

// Canonical UUIDs mirroring the backend app-testdata seed
// (p1ng-application-backend/src/app-testdata/src/main/java/com/p1ng/testdata/catalog).
// Keeping these in sync lets the e2e specs assert identical IDs against MSW (local run)
// and the seeded backend (remote PR-environment run).

/** PROJECT template matrix id (AuthRasciMatricesSeed, domain_type 'project'). */
const PROJECT_MATRIX_ID = 'd9f5594c-1ea2-4330-bb6b-1094b260e458'
/** Canonical e2e Project id (E2eProjectFixtures "Kubernetes Rollout"). */
const E2E_PROJECT_ID = 'e2e00000-0000-0000-0000-000000000001'
/** Object matrix id for the e2e Project (synthetic, MSW-only). */
const E2E_OBJECT_MATRIX_ID = 'aa0e2e00-0000-0000-0000-000000000001'

// Task group ids (AuthRasciTaskGroupsFixture).
const TG_INITIATION = '14b9c670-ff5c-4590-8294-58a5fb12e47a'
const TG_EXECUTION = 'bae90c82-037f-4dee-9019-53c47fdad63a'
const TG_CLOSURE = 'd082b0b3-a681-48ee-8945-68e7c1bf10f6'

// Role group ids (AuthRasciRoleGroupsSeed).
const RG_GOVERNANCE = 'e1cbe15d-ad54-4ed9-a449-7f5d87fcba49'
const RG_MANAGEMENT = '53592e4e-b992-4eb5-932d-ea97ab835d42'
const RG_SUPPORT = 'd6365786-9cf0-4253-8376-20f6f5ad0a06'

// Project task ids (AuthRasciTasksFixture, matrix_id = PROJECT_MATRIX_ID).
const TASK_INITIATION_REQUEST = '1e765415-58b8-442c-a16d-4ae726bcd8f2'
const TASK_CHARTER = '65b35dcb-f58c-425d-a774-06a868c648af'
const TASK_COORDINATION = '22967230-043c-4150-b33a-e77dd85e500b'
const TASK_MONITOR_PERFORMANCE = 'a8ea9cf4-2bea-4e43-8200-f4feeb0fd5cd'
const TASK_CLOSURE_REPORT = '19d78dc6-748a-4508-932d-b1dac64fd862'
const TASK_LESSONS_LEARNED = '9ec38302-ca40-4526-bd05-34ca8c0d19b7'

// Project role ids (AuthRasciRolesFixture, matrix_id = PROJECT_MATRIX_ID).
const ROLE_PSC = '6484e811-b118-4c8e-baf9-aff293f769e4'
const ROLE_PM = '28cde648-8090-4822-ad37-b6d90f7b4d51'
const ROLE_PO = 'e4d000bb-4518-44d8-9353-f38b85941354'
const ROLE_PCT = '52fd83bd-fb78-4121-9047-acf4fc2a2c03'

/**
 * Builds the standard RASCI resource operation map for a task's primary resource.
 * @param name - The resource name exposed by the task.
 * @returns A {@link TaskResource} with the standard per-key operation sets.
 */
function projectResource(name: string): TaskResource {
  return {
    name,
    operationsByKey: [
      { permissionKey: 'R', operations: ['read'] },
      { permissionKey: 'A', operations: ['read', 'create', 'update', 'delete'] },
      { permissionKey: 'S', operations: ['read', 'update'] },
      { permissionKey: 'C', operations: ['read', 'create'] },
      { permissionKey: 'I', operations: ['read'] },
    ],
  }
}

/** In-memory seed data: task groups used across all MSW matrix handlers. */
export const taskGroups: TaskGroup[] = [
  { id: TG_INITIATION, name: 'Initiation & Planning', description: null, sortOrder: 10 },
  { id: TG_EXECUTION, name: 'Execution & Monitoring', description: null, sortOrder: 20 },
  { id: TG_CLOSURE, name: 'Closure & Review', description: null, sortOrder: 30 },
]

/** In-memory seed data: role groups used across all MSW matrix handlers. */
export const roleGroups: RoleGroup[] = [
  { id: RG_GOVERNANCE, name: 'Governance', description: null, sortOrder: 10, color: '#1E3A5F' },
  { id: RG_MANAGEMENT, name: 'Management', description: null, sortOrder: 20, color: '#2E7D32' },
  { id: RG_SUPPORT, name: 'Support', description: null, sortOrder: 30, color: '#8E5A1F' },
]

/** In-memory seed data: task definitions shared across template and object matrices. */
export const templateTasks: MatrixTask[] = [
  {
    id: TASK_INITIATION_REQUEST,
    name: 'Project: Initiation Request',
    description: 'Projektinitiierungsantrag',
    isFixed: true,
    resources: [projectResource('Project')],
    groupId: TG_INITIATION,
  },
  {
    id: TASK_CHARTER,
    name: 'Project: Charter',
    description: 'Projektauftrag',
    isFixed: true,
    resources: [projectResource('ProjectCharter')],
    groupId: TG_INITIATION,
  },
  {
    id: TASK_COORDINATION,
    name: 'Project: Coordination',
    description: 'Projektkoordinierung',
    isFixed: true,
    resources: [projectResource('Project')],
    groupId: TG_EXECUTION,
  },
  {
    id: TASK_MONITOR_PERFORMANCE,
    name: 'Project: Monitor Performance',
    description: 'Projektleistung überwachen',
    isFixed: true,
    resources: [projectResource('Project')],
    groupId: TG_EXECUTION,
  },
  {
    id: TASK_CLOSURE_REPORT,
    name: 'Project: Closure Report',
    description: 'Projektabschlussbericht',
    isFixed: true,
    resources: [projectResource('Project')],
    groupId: TG_CLOSURE,
  },
  {
    id: TASK_LESSONS_LEARNED,
    name: 'Project: Lessons Learned',
    description: 'Lessons Learned und Empfehlungen',
    isFixed: true,
    resources: [projectResource('Project')],
    groupId: TG_CLOSURE,
  },
]

/** In-memory seed data: role definitions used as the template for all object matrices. */
export const templateRoles: MatrixRole[] = [
  {
    id: ROLE_PSC,
    name: 'Project Steering Committee',
    shortTitle: 'PSC',
    description: 'Project Steering Committee',
    isFixed: false,
    isDefault: false,
    groupId: RG_GOVERNANCE,
    tasks: [
      { taskId: TASK_INITIATION_REQUEST, permissionKey: 'I' },
      { taskId: TASK_CHARTER, permissionKey: 'R' },
      { taskId: TASK_COORDINATION, permissionKey: 'R' },
      { taskId: TASK_MONITOR_PERFORMANCE, permissionKey: 'R' },
      { taskId: TASK_CLOSURE_REPORT, permissionKey: 'R' },
      { taskId: TASK_LESSONS_LEARNED, permissionKey: 'I' },
    ],
  },
  {
    id: ROLE_PM,
    name: 'Project Management',
    shortTitle: 'PM',
    description: 'Project Manager',
    isFixed: true,
    isDefault: true,
    groupId: RG_MANAGEMENT,
    tasks: [
      { taskId: TASK_INITIATION_REQUEST, permissionKey: 'A' },
      { taskId: TASK_CHARTER, permissionKey: 'A' },
      { taskId: TASK_COORDINATION, permissionKey: 'A' },
      { taskId: TASK_MONITOR_PERFORMANCE, permissionKey: 'A' },
      { taskId: TASK_CLOSURE_REPORT, permissionKey: 'A' },
      { taskId: TASK_LESSONS_LEARNED, permissionKey: 'A' },
    ],
  },
  {
    id: ROLE_PO,
    name: 'Project Owner',
    shortTitle: 'PO',
    description: 'Project Owner',
    isFixed: false,
    isDefault: false,
    groupId: RG_MANAGEMENT,
    tasks: [
      { taskId: TASK_INITIATION_REQUEST, permissionKey: 'S' },
      { taskId: TASK_CHARTER, permissionKey: 'C' },
      { taskId: TASK_COORDINATION, permissionKey: 'R' },
      { taskId: TASK_MONITOR_PERFORMANCE, permissionKey: 'R' },
      { taskId: TASK_CLOSURE_REPORT, permissionKey: 'C' },
      { taskId: TASK_LESSONS_LEARNED, permissionKey: 'S' },
    ],
  },
  {
    id: ROLE_PCT,
    name: 'Project Core Team',
    shortTitle: 'PCT',
    description: 'Project Core Team',
    isFixed: false,
    isDefault: false,
    groupId: RG_SUPPORT,
    tasks: [
      { taskId: TASK_INITIATION_REQUEST, permissionKey: 'C' },
      { taskId: TASK_CHARTER, permissionKey: 'R' },
      { taskId: TASK_COORDINATION, permissionKey: 'I' },
      { taskId: TASK_MONITOR_PERFORMANCE, permissionKey: 'R' },
      { taskId: TASK_CLOSURE_REPORT, permissionKey: 'I' },
      { taskId: TASK_LESSONS_LEARNED, permissionKey: 'R' },
    ],
  },
]

const projectTemplateMatrix: MatrixDetail = {
  id: PROJECT_MATRIX_ID,
  domainType: 'PROJECT',
  objectId: null,
  roles: templateRoles.map((r) => ({ ...r, tasks: r.tasks.map((t) => ({ ...t })) })),
  tasks: templateTasks,
}

/** In-memory seed data: the default PROJECT template matrix. */
export const templateMatrix: MatrixDetail = {
  id: PROJECT_MATRIX_ID,
  domainType: 'PROJECT',
  objectId: null,
  roles: templateRoles,
  tasks: templateTasks,
}

/** In-memory seed data: named matrices keyed by matrix ID for direct lookup. */
export const namedMatrices: Record<string, MatrixDetail> = {
  [PROJECT_MATRIX_ID]: projectTemplateMatrix,
}

/** In-memory seed data: mutable object matrices keyed by objectId; mutated by MSW handlers. */
export const objectMatrices: Record<string, MatrixDetail> = {
  [E2E_PROJECT_ID]: {
    id: E2E_OBJECT_MATRIX_ID,
    domainType: 'PROJECT',
    objectId: E2E_PROJECT_ID,
    roles: templateRoles.map((r) => ({ ...r, tasks: r.tasks.map((t) => ({ ...t })) })),
    tasks: templateTasks,
  },
}

// crypto.randomUUID() unavailable in MSW fallback mode (plain HTTP, non-localhost).
// getRandomValues() works in all contexts including fallback mode.
function randomUUID(): string {
  const b = new Uint8Array(16)
  crypto.getRandomValues(b)
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

/**
 * Returns the object matrix for `objectId`, creating a deep copy of the template if one does not exist yet.
 *
 * @param objectId - The object (project/program/portfolio) ID.
 * @returns The mutable `MatrixDetail` for the given object.
 */
export function findOrCreateObjectMatrix(objectId: string): MatrixDetail {
  if (!objectMatrices[objectId]) {
    objectMatrices[objectId] = {
      id: randomUUID(),
      domainType: 'PROJECT',
      objectId,
      roles: templateRoles.map((r) => ({
        ...r,
        tasks: r.tasks.map((t) => ({ ...t })),
      })),
      tasks: templateTasks,
    }
  }
  return objectMatrices[objectId]
}

/**
 * Returns a fresh UUID for a newly created role group in MSW seed mutations.
 * @returns An RFC 4122 UUID string.
 */
export function nextRoleGroupId() {
  return randomUUID()
}
/**
 * Returns a fresh UUID for a newly created template role in MSW seed mutations.
 * @returns An RFC 4122 UUID string.
 */
export function nextRoleId() {
  return randomUUID()
}
/**
 * Returns a fresh UUID for a newly created custom object-role in MSW seed mutations.
 * @returns An RFC 4122 UUID string.
 */
export function nextCustomRoleId() {
  return randomUUID()
}
