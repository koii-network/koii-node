import { useQuery } from 'react-query';

import { fetchKoiiPrice } from 'renderer/services/api/utils';

export function useKoiiPrice() {
  return useQuery({
    queryKey: ['koiiPrice'],
    queryFn: fetchKoiiPrice,
    // Refresh every 1 hour
    refetchInterval: 60 * 60 * 1000,
    // Keep data fresh for 1 hour
    staleTime: 60 * 60 * 1000,
  });
}
