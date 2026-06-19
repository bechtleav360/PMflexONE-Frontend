import { useCallback, useState } from 'react'

const STORAGE_KEY = 'p1ng-sidebar:groups'

function isRecord(value: unknown): value is Record<string, boolean> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readStorage(): Record<string, boolean> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return isRecord(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function writeStorage(state: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage not available
  }
}

/**
 * Manages open/closed state for a nav group with localStorage persistence.
 *
 * Priority on first render: if the group has an active route → open regardless
 * of stored value. Otherwise restore from localStorage, defaulting to closed.
 * After first render, every toggle is written back to localStorage.
 * @param groupKey - Unique key used to persist the open/closed state in localStorage.
 * @param hasActiveItem - Whether the group contains the currently active route.
 * @returns Object with `open` boolean state and `setOpen` setter that also persists to localStorage.
 */
export function useNavGroupOpen(groupKey: string, hasActiveItem: boolean) {
  const [open, setOpenState] = useState(() => {
    if (hasActiveItem) return true
    return readStorage()[groupKey] ?? false
  })

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next)
      const stored = readStorage()
      writeStorage({ ...stored, [groupKey]: next })
    },
    [groupKey],
  )

  return { open, setOpen }
}
