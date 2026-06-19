import { setupServer } from 'msw/node'

import { handlers } from './handlers'

/** MSW Node server for request mocking in Vitest tests. */
export const server = setupServer(...handlers)
