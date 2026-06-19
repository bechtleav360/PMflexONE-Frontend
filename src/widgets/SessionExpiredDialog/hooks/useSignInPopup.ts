import { useCallback, useEffect, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { AUTH_POPUP_MESSAGE, AUTH_POPUP_NAME, useAuthSessionStore } from '@/shared/lib/authSession'

/** Represents the current state of the re-authentication popup flow. */
export type SignInState = 'idle' | 'pending' | 'verifying' | 'error' | 'blocked'

async function probeAuth(): Promise<boolean> {
  try {
    const res = await fetch('/graphql', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Manages the oauth2-proxy re-authentication popup flow.
 * Opens a popup to `/oauth2/start`, polls for completion, verifies auth,
 * and invalidates all queries on success.
 * @returns The current sign-in state and the function to open the popup.
 */
export function useSignInPopup(): { signInState: SignInState; openSignIn: () => void } {
  const queryClient = useQueryClient()
  const markRestored = useAuthSessionStore((s) => s.markRestored)
  const sessionExpired = useAuthSessionStore((s) => s.sessionExpired)
  const [signInState, setSignInState] = useState<SignInState>('idle')
  const popupRef = useRef<Window | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const restoringRef = useRef(false)

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const handleRestored = useCallback(async () => {
    if (restoringRef.current) return
    restoringRef.current = true
    stopPolling()
    setSignInState('verifying')

    const ok = await probeAuth()
    if (ok) {
      await queryClient.invalidateQueries()
      setSignInState('idle')
      restoringRef.current = false
      markRestored()
    } else {
      setSignInState('error')
      restoringRef.current = false
    }
  }, [stopPolling, markRestored, queryClient])

  const openSignIn = useCallback(() => {
    const popup = window.open('/oauth2/start', AUTH_POPUP_NAME, 'width=600,height=700,popup')

    if (!popup) {
      setSignInState('blocked')
      return
    }

    setSignInState('pending')
    popupRef.current = popup

    // Fallback: detect when the user closes the popup without completing auth.
    // The primary completion path is the postMessage from main.tsx.
    intervalRef.current = setInterval(() => {
      const win = popupRef.current
      if (!win || restoringRef.current) return
      if (win.closed) void handleRestored()
    }, 500)
  }, [handleRestored])

  // Primary completion path: popup broadcasts via BroadcastChannel after
  // oauth2-proxy redirects back and main.tsx detects window.name === AUTH_POPUP_NAME.
  // BroadcastChannel works even when window.opener is null due to COOP headers.
  useEffect(() => {
    if (!sessionExpired) return

    const channel = new BroadcastChannel(AUTH_POPUP_NAME)
    channel.onmessage = (e: MessageEvent<unknown>) => {
      if (
        typeof e.data === 'object' &&
        e.data !== null &&
        (e.data as Record<string, unknown>).type === AUTH_POPUP_MESSAGE
      ) {
        void handleRestored()
      }
    }

    return () => {
      channel.close()
    }
  }, [sessionExpired, handleRestored])

  // Stop polling and reset refs when session is no longer expired
  useEffect(() => {
    if (!sessionExpired) {
      stopPolling()
      restoringRef.current = false
    }
  }, [sessionExpired, stopPolling])

  // Cleanup polling on unmount
  useEffect(() => stopPolling, [stopPolling])

  return { signInState, openSignIn }
}
