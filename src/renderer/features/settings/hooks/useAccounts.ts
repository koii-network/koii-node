import { useQuery } from 'react-query';

import { getAllAccountsResponse } from 'models/api';
import { getAllAccounts, QueryKeys } from 'renderer/services';

export const useAccounts = () => {
  const {
    data: accounts,
    isLoading,
    error,
  } = useQuery<getAllAccountsResponse, Error>(
    [QueryKeys.Accounts],
    getAllAccounts
  );

  return { accounts, loadingAccounts: isLoading, accountsError: error };
};
