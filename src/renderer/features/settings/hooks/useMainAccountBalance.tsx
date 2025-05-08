import { useQuery } from 'react-query';

import {
  ACCOUNT_BALANCE_DATA_DEFAULT_STALE_TIME,
  ACCOUNT_BALANCE_DATA_REFETCH_INTERVAL,
} from 'config/refetchIntervals';
import { getAccountBalance, QueryKeys } from 'renderer/services';

import { useMainAccount } from './useMainAccount';

type OptionsType = {
  onSuccess?: (balance: number) => void;
};

export const useMainAccountBalance = (options?: OptionsType) => {
  const { onSuccess } = options || {};
  const { data: mainAccountPublicKey } = useMainAccount();
  const mainAccountBalanceCacheKey = [
    QueryKeys.MainAccountBalance,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mainAccountPublicKey!,
  ];

  const {
    data: accountBalance,
    isLoading: loadingAccountBalance,
    isFetched,
    error: accountBalanceLoadingError,
    refetch: refetchAccountBalance,
    isRefetching: isRefetchingAccountBalance,
  } = useQuery(
    mainAccountBalanceCacheKey,
    () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return getAccountBalance(mainAccountPublicKey!);
    },
    {
      enabled: !!mainAccountPublicKey,
      onSuccess,
      refetchInterval: ACCOUNT_BALANCE_DATA_REFETCH_INTERVAL,
      staleTime: ACCOUNT_BALANCE_DATA_DEFAULT_STALE_TIME,
      onError() {
        console.error(`Error fetching balance for ${mainAccountPublicKey}`);
      },
    }
  );

  // true only for initial loading, false for refetches
  const isInitialLoading = loadingAccountBalance && !isFetched;

  return {
    accountBalance,
    loadingAccountBalance,
    accountBalanceLoadingError,
    mainAccountBalanceCacheKey,
    refetchAccountBalance,
    isRefetchingAccountBalance,
    isInitialLoading,
  };
};
