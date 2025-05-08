import { useQuery, UseQueryOptions } from 'react-query';

import { fetchMultipleKPLTokenMetadata, QueryKeys } from 'renderer/services';

const oneHourInMilliseconds = 60 * 60 * 1000;

export function useMultipleKplTokenMetadata(
  mintAddresses: string[],
  options?: UseQueryOptions
) {
  return useQuery(
    [QueryKeys.KplTokenMetadata, mintAddresses],
    () => fetchMultipleKPLTokenMetadata(mintAddresses),
    {
      staleTime: oneHourInMilliseconds,
      cacheTime: oneHourInMilliseconds,
      enabled: !options || options?.enabled,
    }
  );
}
