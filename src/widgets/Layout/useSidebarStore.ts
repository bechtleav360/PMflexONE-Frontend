import { create } from 'zustand'

interface SidebarState {
  collapsed: boolean
  toggleCollapsed: () => void
  setCollapsed: (collapsed: boolean) => void
}

/** Zustand store for sidebar collapsed UI state. */
export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
  setCollapsed: (collapsed) => set({ collapsed }),
}))
