import { useQuery, UseQueryOptions } from 'react-query';

import { fetchKPLTokenMetadata, QueryKeys } from 'renderer/services';

const oneHourInMilliseconds = 60 * 60 * 1000;

export function useKplTokenMetadata(
  mintAddress: string,
  options?: UseQueryOptions
) {
  return useQuery(
    [QueryKeys.KplTokenMetadata, mintAddress],
    () => fetchKPLTokenMetadata(mintAddress),
    {
      staleTime: oneHourInMilliseconds,
      cacheTime: oneHourInMilliseconds,
      enabled: !options || options?.enabled,
    }
  );
}
