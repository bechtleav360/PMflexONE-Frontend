import { useState } from 'react'

import type { ProjectWorkItem } from '@/entities/work-item'
import { useArchiveWorkItem } from '@/features/work-item-crud'

interface UseArchivePoolItemResult {
  pendingArchive: ProjectWorkItem | null
  setPendingArchive: (item: ProjectWorkItem | null) => void
  handleArchiveConfirmed: () => Promise<void>
}

/**
 * Manages archive confirmation state and the archive mutation for a pool item.
 * @returns Pending archive state, setter, and confirmed-archive handler.
 */
export function useArchivePoolItem(): UseArchivePoolItemResult {
  const [pendingArchive, setPendingArchive] = useState<ProjectWorkItem | null>(null)
  const { mutateAsync: archive } = useArchiveWorkItem()

  async function handleArchiveConfirmed() {
    if (!pendingArchive) return
    try {
      await archive({ id: pendingArchive.id, version: pendingArchive.version })
    } catch {
      /* toast handled in hook */
    } finally {
      setPendingArchive(null)
    }
  }

  return { pendingArchive, setPendingArchive, handleArchiveConfirmed }
}
