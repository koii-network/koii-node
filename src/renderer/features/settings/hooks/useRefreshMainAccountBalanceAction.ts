import { useCallback } from 'react';
import { useQueryClient } from 'react-query';

import { QueryKeys } from 'renderer/services';

import { useMainAccount } from './useMainAccount';

export const useRefreshMainAccountBalanceAction = () => {
  const queryCache = useQueryClient();
  const { data: mainAccountPublicKey } = useMainAccount();

  const refreshMainAccountBalance = useCallback(async () => {
    const mainAccountBalanceCacheKey = [
      QueryKeys.MainAccountBalance,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mainAccountPublicKey!,
    ];
    await queryCache.invalidateQueries(mainAccountBalanceCacheKey);
  }, [mainAccountPublicKey, queryCache]);

  return {
    refreshMainAccountBalance,
  };
};
