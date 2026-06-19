import { gql } from 'graphql-request'
import { z } from 'zod'

/** GraphQL query that fetches all portfolios, optionally filtered. */
export const GET_PORTFOLIOS = gql`
  query GetPortfolios($filter: PortfolioFilter) {
    portfolios(filter: $filter) {
      id
      version
      name
      startYear
      endYear
      createdAt
    }
  }
`

/** GraphQL mutation that creates a new portfolio and returns the persisted entity. */
export const CREATE_PORTFOLIO = gql`
  mutation CreatePortfolio($input: CreatePortfolioInput!) {
    createPortfolio(input: $input) {
      id
      version
      name
      startYear
      endYear
      createdAt
    }
  }
`

/** GraphQL mutation that updates an existing portfolio by ID and returns the updated entity. */
export const UPDATE_PORTFOLIO = gql`
  mutation UpdatePortfolio($id: ID!, $input: UpdatePortfolioInput!) {
    updatePortfolio(id: $id, input: $input) {
      id
      version
      name
      startYear
      endYear
      createdAt
    }
  }
`

/** GraphQL mutation that deletes a portfolio by ID. */
export const DELETE_PORTFOLIO = gql`
  mutation DeletePortfolio($input: DeletePortfolioInput!) {
    deletePortfolio(input: $input)
  }
`

/**
 * Zod schema for a single portfolio entity as returned by the GraphQL API.
 * Shared across all portfolio hooks to validate responses at the API boundary.
 */
export const portfolioResponseSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  startYear: z.number().int().nullable(),
  endYear: z.number().int().nullable(),
  createdAt: z.string(),
})
