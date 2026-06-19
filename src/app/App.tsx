import { ComponentShowcaseDrawer } from '@/widgets/ComponentShowcase'
import { LicensesDialog } from '@/widgets/LicensesDialog'
import { SessionExpiredDialog } from '@/widgets/SessionExpiredDialog'

import { ErrorBoundary } from './ErrorBoundary'
import { Providers } from './Providers'
import { Router } from './Router'

/**
 * Application root. Composes global providers with the client-side router.
 * @returns The fully wrapped application tree.
 */
export function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <Router />
        <LicensesDialog />
        <SessionExpiredDialog />
        {import.meta.env.DEV ? <ComponentShowcaseDrawer /> : null}
      </Providers>
    </ErrorBoundary>
  )
}
