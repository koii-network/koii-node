import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { getKPLBalance, QueryKeys } from 'renderer/services';

import { TokenItemType } from '../types';

import { useMultipleKplTokenMetadata } from './useMultipleKPLTokenMetadata';

type ParamsType = {
  publicKey: string;
  enabled?: boolean;
};

export function useKplTokens({ publicKey, enabled = true }: ParamsType) {
  const {
    data: kpLBalanceList,
    error: kpLBalanceError,
    isLoading: isKpLBalanceLoading,
    isFetching: isKpLBalanceFetching,
  } = useQuery(
    [QueryKeys.KplBalanceList, publicKey],
    () => getKPLBalance(publicKey),
    { enabled }
  );

  const {
    data: kplList,
    error: kplListError,
    isLoading: isKplListLoading,
  } = useMultipleKplTokenMetadata(kpLBalanceList?.map((e) => e.mint) || [], {
    enabled: !!kpLBalanceList && !isKpLBalanceLoading,
  });

  const filteredkplTokenItems = useMemo(() => {
    if (!kplList || !kpLBalanceList) {
      return [];
    }

    return kplList.reduce((acc: TokenItemType[], token) => {
      const matchingBalance = kpLBalanceList.find(
        (balance) => balance?.mint === token?.address
      );

      if (matchingBalance) {
        acc.push({
          name: token?.name,
          mint: token?.address,
          symbol: token?.symbol,
          logoURI: token?.logoURI,
          decimals: token?.decimals,
          balance: matchingBalance?.balance,
          associateTokenAddress: matchingBalance?.associateTokenAddress,
        });
      }

      return acc;
    }, []);
  }, [kpLBalanceList, kplList]);

  return {
    kplTokenItems: filteredkplTokenItems,
    kplListError,
    isLoadingTokensData: isKplListLoading || isKpLBalanceLoading,
    kpLBalanceError,
    isKpLBalanceFetching,
  };
}
