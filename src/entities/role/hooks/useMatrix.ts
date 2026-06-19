import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'

import { getMatrix } from '../api/getMatrix'
import { roleQueryKeys } from '../model/role.queryKeys'
import type { DomainType, MatrixDetail } from '../model/role.types'

/**
 * Parameters for the useMatrix query hook.
 */
export interface UseMatrixParams {
  matrixId?: string
  domainType?: DomainType
  objectId?: string | null
}

/**
 * Fetches the detail of a single RASCI matrix and returns the React Query result.
 *
 * @param params - Matrix lookup parameters (matrixId, domainType, objectId).
 * @param options - Optional TanStack Query overrides applied on top of the defaults.
 * @returns The React Query result containing the MatrixDetail.
 */
export function useMatrix(
  params: UseMatrixParams,
  options?: Partial<UseQueryOptions<MatrixDetail>>,
) {
  return useQuery<MatrixDetail>({
    queryKey: roleQueryKeys.matrix(params),
    queryFn: () => getMatrix(params),
    staleTime: 0,
    ...options,
  })
}
