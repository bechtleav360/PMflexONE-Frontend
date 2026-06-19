/**
 * Optional filter applied when fetching the portfolios list.
 *
 * @property name - Substring match on portfolio name.
 * @property startYear - Exact match on portfolio start year.
 * @property endYear - Exact match on portfolio end year.
 */
export interface PortfolioFilter {
  name?: string | null
  startYear?: number | null
  endYear?: number | null
}

/**
 * A portfolio entity as returned by the GraphQL API.
 *
 * @property id - Unique server-assigned identifier.
 * @property name - Human-readable portfolio name (1–255 characters). Displayed as "Title" in the UI.
 * @property startYear - Optional start year (4-digit integer).
 * @property endYear - Optional end year (4-digit integer).
 * @property createdAt - ISO 8601 datetime string assigned by the server.
 */
export interface Portfolio {
  id: string
  version: number
  name: string
  startYear: number | null
  endYear: number | null
  createdAt: string
}

/**
 * Input payload for the createPortfolio GraphQL mutation.
 *
 * @property name - Required portfolio name (1–255 characters, trimmed). Displayed as "Title" in the UI.
 * @property startYear - Optional start year.
 * @property endYear - Optional end year; must be ≥ startYear when both are set.
 */
export interface CreatePortfolioInput {
  name: string
  startYear: number | null
  endYear: number | null
}

/**
 * Input payload for the updatePortfolio GraphQL mutation.
 *
 * @property name - Updated portfolio name (1–255 characters, trimmed). Displayed as "Title" in the UI.
 * @property startYear - Updated optional start year.
 * @property endYear - Updated optional end year; must be ≥ startYear when both are set.
 */
export interface UpdatePortfolioInput {
  version: number
  name: string
  startYear: number | null
  endYear: number | null
}
