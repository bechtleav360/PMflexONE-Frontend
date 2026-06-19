import type { Project } from '@/entities/project'
import { createModalStoreWithPayload } from '@/shared/lib'

/**
 * Ephemeral Zustand store for the edit-project modal open/close state.
 *
 * Stores the project being edited as `payload` so the form can be pre-populated
 * without prop drilling from `ProjectsPage` through to `EditProjectForm`.
 */
export const useEditProjectStore = createModalStoreWithPayload<Project>()
