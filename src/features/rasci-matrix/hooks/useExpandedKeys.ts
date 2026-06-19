import { useState } from 'react'

import type { PermissionKey } from '@/entities/role'

/**
 * Manages a set of expanded permission keys for collapsible resource panels in cell-edit dialogs.
 *
 * @returns The current expanded key set and a toggle function.
 */
export function useExpandedKeys() {
  const [expandedKeys, setExpandedKeys] = useState<Set<PermissionKey>>(new Set())

  /**
   * Toggles a permission key's expanded state.
   * @param key - The permission key to toggle.
   */
  function toggleExpanded(key: PermissionKey) {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return { expandedKeys, toggleExpanded }
}
