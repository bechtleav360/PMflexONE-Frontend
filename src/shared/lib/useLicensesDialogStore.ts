import { create } from 'zustand'

interface LicensesDialogStore {
  open: boolean
  setOpen: (open: boolean) => void
}

/** Zustand store controlling the open/closed state of the third-party LicensesDialog. */
export const useLicensesDialogStore = create<LicensesDialogStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}))
