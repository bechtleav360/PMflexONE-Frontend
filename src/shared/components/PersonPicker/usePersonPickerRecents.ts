import { useState } from 'react'

/** Minimal person data returned by the search API and stored in recents. */
export interface PersonResult {
  id: string
  firstName: string
  lastName: string
  mail?: string
}

const MAX_RECENTS = 5

/**
 * Parses stored recent persons from localStorage.
 *
 * @param storageKey - localStorage key to read from.
 * @returns Parsed entries, or `[]` on missing data, parse error, or invalid shape.
 */
function parseStoredRecents(storageKey: string): PersonResult[] {
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (p): p is PersonResult =>
        p !== null &&
        typeof p === 'object' &&
        typeof (p as Record<string, unknown>).id === 'string' &&
        typeof (p as Record<string, unknown>).firstName === 'string' &&
        typeof (p as Record<string, unknown>).lastName === 'string',
    )
  } catch {
    return []
  }
}

/**
 * Persists recently selected persons in localStorage.
 *
 * @param storageKey - localStorage key to use.
 * @returns Object with `recents`, `addRecent`, and `removeRecent`.
 */
export function usePersonPickerRecents(storageKey: string) {
  const [recents, setRecents] = useState<PersonResult[]>(() => parseStoredRecents(storageKey))

  function addRecent(person: PersonResult) {
    setRecents((prev) => {
      const next = [person, ...prev.filter((p) => p.id !== person.id)].slice(0, MAX_RECENTS)
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        // quota exceeded — ignore
      }
      return next
    })
  }

  function removeRecent(id: string) {
    setRecents((prev) => {
      const next = prev.filter((p) => p.id !== id)
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        // quota exceeded — ignore
      }
      return next
    })
  }

  return { recents, addRecent, removeRecent }
}
