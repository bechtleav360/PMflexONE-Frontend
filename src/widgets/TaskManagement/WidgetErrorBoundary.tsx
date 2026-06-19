import { Component, type ErrorInfo, type ReactNode } from 'react'

import { traceUiError } from '@/shared/lib/telemetry'

import { WidgetErrorFallback } from './WidgetErrorFallback'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Widget-scoped error boundary that catches render errors in task-management sections.
 * Displays an inline fallback instead of crashing the whole widget.
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  public override readonly state: State = { hasError: false }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    traceUiError(error, errorInfo.componentStack, {
      path: typeof window === 'undefined' ? 'unknown' : window.location.pathname,
    })
  }

  private readonly handleReset = () => {
    this.setState({ hasError: false })
  }

  public override render() {
    if (this.state.hasError) {
      return <WidgetErrorFallback onReset={this.handleReset} />
    }

    return this.props.children
  }
}
