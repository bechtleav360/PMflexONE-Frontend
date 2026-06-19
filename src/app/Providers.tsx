import type { ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'

import { ToastProvider, TooltipProvider } from '@/shared/components'
import { queryClient } from '@/shared/lib/queryClient'
import { SseProvider } from '@/shared/lib/sse'

import { ThemeProvider } from './ThemeProvider'

interface Props {
  children: ReactNode
}

/**
 * Composes all global React context providers required by the application.
 *
 * Provider order (outermost first): ThemeProvider → QueryClientProvider → SseProvider → TooltipProvider.
 * SseProvider sits inside QueryClientProvider so feature hooks can call useQueryClient()
 * inside useSse() handlers.
 * @param props - Component props.
 * @param props.children - The application subtree to wrap.
 * @returns The children wrapped in all global providers.
 */
export function Providers({ children }: Props) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SseProvider>
          <TooltipProvider>
            {children}
            <ToastProvider />
          </TooltipProvider>
        </SseProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
