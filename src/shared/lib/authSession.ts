import { ClientError } from 'graphql-request'
import { create } from 'zustand'

/**
 * Name given to the auth popup window and used as the BroadcastChannel name.
 * `window.name` persists through cross-origin navigations, making it a reliable
 * signal that the current context is the auth popup.
 */
export const AUTH_POPUP_NAME = 'p1ng-auth' as const

/** Message type broadcast by the auth popup after authentication completes. */
export const AUTH_POPUP_MESSAGE = 'p1ng:auth-complete' as const

interface AuthSessionState {
  /** Whether the current session cookie is invalid and the user must re-authenticate. */
  sessionExpired: boolean
  /** Mark the session as expired to surface the re-auth dialog. */
  markExpired: () => void
  /** Mark the session as restored after successful re-authentication. */
  markRestored: () => void
}

/**
 * Zustand store tracking auth session expiry state.
 * Controls visibility of the session expired dialog.
 * @returns The auth session store state and actions.
 */
export const useAuthSessionStore = create<AuthSessionState>((set) => ({
  sessionExpired: false,
  markExpired: () => {
    set({ sessionExpired: true })
  },
  markRestored: () => {
    set({ sessionExpired: false })
  },
}))

/**
 * Returns true when the error represents an unauthenticated or unauthorized response
 * from graphql-request.
 * @param error - The error to inspect.
 * @returns Whether the error is an HTTP 401 or 403.
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ClientError) {
    return error.response.status === 401 || error.response.status === 403
  }
  return false
}
