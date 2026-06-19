import { createContext } from 'react'

import type { SseClient } from './SseClient'

/** React context carrying the active SseClient instance. */
export const SseContext = createContext<SseClient | null>(null)
