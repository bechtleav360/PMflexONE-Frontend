import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { CRUMB_SEP } from '@/shared/lib/constants'

/** Props for {@link StakeholderRegisterBreadcrumb}. */
export interface StakeholderRegisterBreadcrumbProps {
  parentListLabel: string
  parentListLink: string
  parentLink: string
  parentName: string
}

/**
 * Breadcrumb navigation bar for the Stakeholder Register page.
 *
 * Renders three crumbs: parent list → parent entity → Stakeholder Register.
 *
 * @param props - Component props.
 * @param props.parentListLabel - Translated label for the parent list link.
 * @param props.parentListLink - Route path for the parent list.
 * @param props.parentLink - Route path for the parent entity detail page.
 * @param props.parentName - Display name of the parent entity.
 * @returns A `<nav>` element with the breadcrumb trail.
 */
export function StakeholderRegisterBreadcrumb({
  parentListLabel,
  parentListLink,
  parentLink,
  parentName,
}: StakeholderRegisterBreadcrumbProps) {
  const { t } = useTranslation()

  return (
    <nav
      aria-label={t('shared.breadcrumb.nav')}
      className="text-muted-foreground flex items-center gap-1 text-sm"
    >
      <Link
        to={parentListLink}
        className="hover:text-foreground hover:underline"
      >
        {parentListLabel}
      </Link>
      <span aria-hidden="true">{CRUMB_SEP}</span>
      <Link
        to={parentLink}
        className="hover:text-foreground hover:underline"
      >
        {parentName}
      </Link>
      <span aria-hidden="true">{CRUMB_SEP}</span>
      <span className="font-medium">{t('pages.stakeholderRegister.pageTitle')}</span>
    </nav>
  )
}
