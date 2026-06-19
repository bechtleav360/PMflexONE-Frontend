import { create } from 'zustand'

/**
 * Shape of a modal store without a payload (e.g. create-project).
 */
export interface ModalStore {
  open: boolean
  openModal: () => void
  closeModal: () => void
}

/**
 * Shape of a modal store that carries a typed payload (e.g. edit-project
 * carries the `Project` being edited; delete-project carries the project `id`).
 */
export interface ModalStoreWithPayload<TPayload> {
  open: boolean
  /** The data passed to `openModal`, or `null` when the modal is closed. */
  payload: TPayload | null
  openModal: (payload: TPayload) => void
  closeModal: () => void
}

/**
 * Creates a Zustand store for ephemeral modal open/close state with no payload.
 *
 * Use this for modals that do not need pre-loaded data (e.g. create flows).
 * Using a Zustand store is the correct FSD mechanism for sharing ephemeral UI
 * state across layers (e.g. a trigger button in `widgets/` opening a modal in
 * `features/`) without prop drilling.
 *
 * @returns A Zustand hook for the modal store.
 */
export function createModalStore() {
  return create<ModalStore>((set) => ({
    open: false,
    openModal: () => set({ open: true }),
    closeModal: () => set({ open: false }),
  }))
}

/**
 * Creates a Zustand store for ephemeral modal open/close state with a typed payload.
 *
 * Use this for modals that must receive data when opening (e.g. edit / delete
 * flows). The payload is exposed as `store.payload` and cleared on `closeModal`.
 *
 * @returns A Zustand hook for the modal store.
 */
export function createModalStoreWithPayload<TPayload>() {
  return create<ModalStoreWithPayload<TPayload>>((set) => ({
    open: false,
    payload: null,
    openModal: (payload) => set({ open: true, payload }),
    closeModal: () => set({ open: false, payload: null }),
  }))
}
