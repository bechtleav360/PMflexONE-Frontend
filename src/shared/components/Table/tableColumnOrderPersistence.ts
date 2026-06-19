import type { TableColumnOrderPersistenceAdapter } from './TableTypes'

const TABLE_COLUMN_ORDER_STORAGE_PREFIX = 'p1ng-table-column-order'

function getTableColumnOrderStorageKey(key: string) {
  return `${TABLE_COLUMN_ORDER_STORAGE_PREFIX}:${key}`
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

/**
 * Built-in localStorage adapter used for shared table column order persistence.
 */
export const localStorageTableColumnOrderPersistenceAdapter: TableColumnOrderPersistenceAdapter = {
  load(key) {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      const rawValue = window.localStorage.getItem(getTableColumnOrderStorageKey(key))

      if (!rawValue) {
        return null
      }

      const parsedValue = JSON.parse(rawValue) as unknown

      return isStringArray(parsedValue) ? parsedValue : null
    } catch {
      return null
    }
  },
  save(key, columnOrder) {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(getTableColumnOrderStorageKey(key), JSON.stringify(columnOrder))
    } catch {
      return
    }
  },
}
