import { setupWorker } from 'msw/browser'

import { handlers } from './handlers'

/** MSW Service Worker for browser-based request mocking during development. */
export const worker = setupWorker(...handlers)
