import { GraphQLClient } from 'graphql-request'

/**
 * Singleton GraphQL client for all feature API modules.
 *
 * The endpoint defaults to `VITE_GRAPHQL_ENDPOINT` (build-time) or
 * `/graphql` (relative, for MSW in tests). Call `setGraphqlEndpoint` during
 * app bootstrap to override with the runtime-config value.
 *
 * Authentication is handled by `oauth2-proxy` at the infrastructure level.
 * Setting `credentials: 'include'` ensures the session cookie is forwarded
 * automatically; no token management is required in the frontend.
 */
export const graphqlClient = new GraphQLClient(
  import.meta.env.VITE_GRAPHQL_ENDPOINT || new URL('/graphql', window.location.origin).href,
  { credentials: 'include' },
)

/**
 * Updates the `Accept-Language` header on all subsequent GraphQL requests.
 * @param lng - BCP 47 language tag (e.g. `'en'`, `'de'`).
 */
export function setGraphqlLanguage(lng: string): void {
  graphqlClient.setHeader('Accept-Language', lng)
}

/**
 * Updates the GraphQL endpoint at runtime (called from bootstrap with the
 * backendUrl from runtime-config.json).
 *
 * @param backendUrl - Base URL of the backend service (e.g. `https://api.example.com`).
 */
export function setGraphqlEndpoint(backendUrl: string): void {
  graphqlClient.setEndpoint(`${backendUrl}/graphql`)
}
