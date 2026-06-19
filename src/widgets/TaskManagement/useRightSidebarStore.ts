import { create } from 'zustand'

type RightSidebarTab = 'active' | 'archive'

interface RightSidebarState {
  isOpen: boolean
  activeTab: RightSidebarTab
  widthPx: number
  open: () => void
  close: () => void
  toggle: () => void
  setActiveTab: (tab: RightSidebarTab) => void
  setWidthPx: (width: number) => void
}

const DEFAULT_WIDTH_PX = 360

/** Zustand store for right sidebar (active/archive) open state and width. */
export const useRightSidebarStore = create<RightSidebarState>((set) => ({
  isOpen: false,
  activeTab: 'active',
  widthPx: DEFAULT_WIDTH_PX,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setWidthPx: (widthPx) => set({ widthPx }),
}))
