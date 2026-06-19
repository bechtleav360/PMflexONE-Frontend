import { create } from 'zustand'

interface ComponentShowcaseDrawerState {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  open: () => void
  close: () => void
  toggle: () => void
}

/** Zustand store for the development component showcase drawer UI state. */
export const useComponentShowcaseDrawerStore = create<ComponentShowcaseDrawerState>((set) => ({
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
