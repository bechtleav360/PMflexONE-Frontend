import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react'

import { traceUiError } from '@/shared/lib/telemetry'

const ErrorBoundaryFallback = lazy(async () => ({
  default: (await import('./ErrorBoundaryFallback')).ErrorBoundaryFallback,
}))

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Top-level React error boundary for the application shell.
 *
 * Render-time failures are traced through the shared telemetry helper and
 * replaced with a recovery screen that lets the user reload the app.
 */
export class ErrorBoundary extends Component<Props, State> {
  public override readonly state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(): State {
    return {
      hasError: true,
    }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    traceUiError(error, errorInfo.componentStack, {
      path: typeof window === 'undefined' ? 'unknown' : window.location.pathname,
    })
  }

  private readonly handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <Suspense
          fallback={
            <div
              aria-busy="true"
              className="bg-background p-xl flex min-h-screen items-center justify-center"
            />
          }
        >
          <ErrorBoundaryFallback onReload={this.handleReload} />
        </Suspense>
      )
    }

    return this.props.children
  }
}
