import type { ChangeHistoryEntry } from '../../types/workItem.types'

/**
 * Collapses same-second `assignee` entry pairs into one before rendering.
 *
 * The backend records an assignee swap as two atomic events in the same
 * transaction — a remove (`newValue = null`) and a link (`oldValue = null`).
 * Both share the same second-level timestamp; milliseconds may differ slightly.
 *
 * Rules:
 * - Remove + Link at the same second → single entry `old → new`
 * - Link only → `— → name` (unchanged)
 * - Remove only → rendered as "Unassigned" by the caller
 *
 * @param entries - Time-sorted change history entries.
 * @returns Entries with same-second assignee pairs collapsed into one.
 */
export function mergeAssigneeEntries(entries: ChangeHistoryEntry[]): ChangeHistoryEntry[] {
  const result: ChangeHistoryEntry[] = []
  const skip = new Set<string>()

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    if (skip.has(e.id)) continue

    if (e.changedField === 'assignee') {
      const eSec = e.changedAt.slice(0, 19)
      const partnerIdx = entries.findIndex(
        (x, j) =>
          j > i &&
          !skip.has(x.id) &&
          x.changedField === 'assignee' &&
          x.changedAt.slice(0, 19) === eSec,
      )

      if (partnerIdx !== -1) {
        const partner = entries[partnerIdx]
        skip.add(partner.id)
        const removeEntry = e.newValue === null ? e : partner
        const assignEntry = e.oldValue === null ? e : partner
        result.push({
          ...e,
          id: `${e.id}+${partner.id}`,
          oldValue: removeEntry.oldValue,
          newValue: assignEntry.newValue,
        })
        continue
      }
    }

    result.push(e)
  }

  return result
}
