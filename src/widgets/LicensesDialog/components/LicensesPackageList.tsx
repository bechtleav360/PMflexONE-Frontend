import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Input } from '@/shared/components'
import type { LicenseSource } from '@/shared/types/licenses'

import { LicensesPackageItem } from './LicensesPackageItem'

interface LicensesPackageListProps {
  sources: LicenseSource[]
}

/**
 * Searchable list of licence sources with a live filter input and result count.
 * @param props - Component props.
 * @param props.sources - Array of licence sources whose packages are listed and searched.
 * @returns The list container element.
 */
export function LicensesPackageList({ sources }: LicensesPackageListProps) {
  const [search, setSearch] = useState('')
  const { t } = useTranslation()

  const allItems = useMemo(
    () => sources.flatMap((s) => s.packages.map((pkg) => ({ pkg, sourceName: s.name }))),
    [sources],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return allItems
    return allItems.filter(
      ({ pkg }) =>
        pkg.name.toLowerCase().includes(query) || pkg.license.toLowerCase().includes(query),
    )
  }, [allItems, search])

  const multiSource = sources.length > 1

  return (
    <div className="gap-md flex min-h-0 flex-1 flex-col">
      <div className="gap-md flex shrink-0 items-center">
        <Input
          aria-label={t('licenses.searchPlaceholder')}
          placeholder={t('licenses.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8"
        />
        <span className="text-muted-foreground shrink-0 text-sm">
          {t('licenses.packageCount', { count: filtered.length })}
        </span>
      </div>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-xl text-center text-sm">{t('licenses.noResults')}</p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {filtered.map(({ pkg, sourceName }) => (
            <LicensesPackageItem
              key={`${sourceName}:${pkg.name}@${pkg.version}`}
              pkg={pkg}
              sourceName={sourceName}
              multiSource={multiSource}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
