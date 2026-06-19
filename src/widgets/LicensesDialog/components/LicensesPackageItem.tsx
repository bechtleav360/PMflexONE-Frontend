import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Badge, Button } from '@/shared/components'
import type { LicensePackage } from '@/shared/types/licenses'

interface LicensesPackageItemProps {
  pkg: LicensePackage
  sourceName: string
  multiSource: boolean
}

/**
 * Renders a single package row with name, version, licence badge, and expandable licence text.
 * @param props - Component props.
 * @param props.pkg - The package data to display.
 * @param props.sourceName - Name of the source this package belongs to.
 * @param props.multiSource - Whether there are multiple sources; controls source label visibility.
 * @returns The list item element.
 */
export function LicensesPackageItem({ pkg, sourceName, multiSource }: LicensesPackageItemProps) {
  const [showText, setShowText] = useState(false)
  const { t } = useTranslation()

  return (
    <li className="border-border gap-xs py-md flex flex-col border-b last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-mono text-sm font-semibold">{pkg.name}</span>
          <span className="text-muted-foreground font-mono text-xs">{pkg.version}</span>
          {multiSource && (
            <span className="text-muted-foreground text-xs">
              {t('licenses.source', { name: sourceName })}
            </span>
          )}
        </div>
        <div className="gap-sm flex shrink-0 items-center">
          <Badge variant="secondary">{pkg.license}</Badge>
          {pkg.licenseText ? (
            <Button
              variant="ghost"
              size="sm"
              className="px-sm h-6 text-xs"
              onClick={() => setShowText((prev) => !prev)}
            >
              {showText ? t('licenses.hideLicenseText') : t('licenses.viewLicenseText')}
            </Button>
          ) : null}
        </div>
      </div>
      {pkg.description ? (
        <p className="text-muted-foreground truncate text-xs">{pkg.description}</p>
      ) : null}
      {showText && pkg.licenseText ? (
        <pre className="bg-muted text-muted-foreground mt-xs p-md max-h-48 overflow-auto rounded-md text-xs whitespace-pre-wrap">
          {pkg.licenseText}
        </pre>
      ) : null}
    </li>
  )
}
