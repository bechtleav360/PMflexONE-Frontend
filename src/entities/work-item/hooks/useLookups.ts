import { useQuery } from '@tanstack/react-query'

import {
  getProjectWorkItemStatusLookup,
  getWorkItemBaseStatusLookup,
  getWorkItemPriorityLookup,
  LOOKUPS_QUERY_KEY,
} from '../api/lookupsApi'
import type { StatusLookup } from '../types/workItem.types'

/**
 * Fetches display labels for all WorkItemBaseStatus values.
 * Loaded once and cached indefinitely — never re-fetched.
 * @returns TanStack Query result containing the lookup entries.
 */
export function useWorkItemBaseStatusLookup() {
  return useQuery<StatusLookup[]>({
    queryKey: LOOKUPS_QUERY_KEY('workItemBaseStatus'),
    queryFn: getWorkItemBaseStatusLookup,
    staleTime: Infinity,
  })
}

/**
 * Fetches display labels for all ProjectWorkItemStatus values (includes 'rejected').
 * Loaded once and cached indefinitely — never re-fetched.
 * @returns TanStack Query result containing the lookup entries.
 */
export function useProjectWorkItemStatusLookup() {
  return useQuery<StatusLookup[]>({
    queryKey: LOOKUPS_QUERY_KEY('projectWorkItemStatus'),
    queryFn: getProjectWorkItemStatusLookup,
    staleTime: Infinity,
  })
}

/**
 * Fetches display labels for all WorkItemPriority values.
 * Loaded once and cached indefinitely — never re-fetched.
 * @returns TanStack Query result containing the lookup entries.
 */
export function useWorkItemPriorityLookup() {
  return useQuery<StatusLookup[]>({
    queryKey: LOOKUPS_QUERY_KEY('workItemPriority'),
    queryFn: getWorkItemPriorityLookup,
    staleTime: Infinity,
  })
}
