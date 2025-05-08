import { useQuery, UseQueryOptions, QueryKey } from 'react-query';

export function useK2Query<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData
>(
  queryKey: QueryKey,
  queryFn: (context: unknown) => Promise<TQueryFnData>,
  options?: UseQueryOptions<TQueryFnData, TError, TData>
) {
  return useQuery<TQueryFnData, TError, TData>(queryKey, queryFn, {
    staleTime: 900000, // default 15min stale time for K2 data requests to minimize K2 queries
    ...options,
  });
}

export default useK2Query;
