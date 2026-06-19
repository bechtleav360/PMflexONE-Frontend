import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

/** Zod schema for the JSON body returned by the `/api/me` endpoint. */
const MeResponseSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string(),
  displayName: z.string(),
  profileImage: z.string().nullable(),
})

/** Minimal user identity shape needed for author-gated UI. */
export interface CurrentUser {
  /** The authenticated user's UUID. */
  id: string
  firstName: string
  lastName: string
  mail: string
}

const CURRENT_USER_QUERY_KEY = ['currentUser'] as const

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const res = await fetch('/api/me', { credentials: 'include' })
  if (!res.ok) return null

  const parsed = MeResponseSchema.safeParse(await res.json())
  if (!parsed.success) return null

  const { id, firstName, lastName, mail } = parsed.data
  return { id, firstName, lastName, mail }
}

/**
 * Returns the currently authenticated user's identity.
 *
 * Identity is resolved from the JSON body of the `/api/me` endpoint.
 * The response is validated with Zod — an unexpected shape returns `null`.
 *
 * Returns `null` when the user is unauthenticated, the endpoint is unreachable,
 * or the response shape fails validation.
 * Cached indefinitely for the session — the user identity cannot change without
 * a full page reload (new session cookie).
 *
 * @returns A TanStack Query result containing the current user or null.
 */
export function useCurrentUser() {
  return useQuery<CurrentUser | null>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: Infinity,
    retry: false,
  })
}
