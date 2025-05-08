import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { QueryKeys, removeAccount, setActiveAccount } from 'renderer/services';

type ParamsType = {
  accountName: string;
  isDefault: boolean;
};

export const useAccount = ({ accountName, isDefault }: ParamsType) => {
  const queryCache = useQueryClient();

  const {
    mutateAsync: deleteAccount,
    isLoading: removingAccountLoading,
    error: removingAccountError,
  } = useMutation<boolean, Error, string>(removeAccount, {
    onSuccess: async () => {
      await queryCache.invalidateQueries([QueryKeys.Accounts]);
    },
  });

  const {
    mutate: setAccountActive,
    isLoading: setAccountActiveLoading,
    error: setAccountActiveError,
  } = useMutation<boolean, Error, string>(setActiveAccount, {
    onSuccess: async () => {
      await queryCache.invalidateQueries(['VipAccess']);
      await queryCache.invalidateQueries([QueryKeys.MainAccount]);
      await queryCache.invalidateQueries([QueryKeys.Accounts]);
      await queryCache.invalidateQueries([QueryKeys.StakingAccount]);
      queryCache.removeQueries(QueryKeys.KPLStakingAccount);
      await queryCache.invalidateQueries(QueryKeys.KPLStakingAccount);
      queryCache.invalidateQueries([QueryKeys.mainAccountBalance]);
      queryCache.invalidateQueries([QueryKeys.MainAccountName]);
      queryCache.invalidateQueries([QueryKeys.TaskList]);
      queryCache.invalidateQueries([QueryKeys.TaskStake]);
    },
  });

  const removeAccountHandler = useCallback(async () => {
    if (isDefault) {
      return;
    }
    await deleteAccount(accountName);
  }, [isDefault, deleteAccount, accountName]);

  const setAccountActiveHandler = useCallback(async () => {
    setAccountActive(accountName);
  }, [setAccountActive, accountName]);

  return {
    deleteAccount: removeAccountHandler,
    setAccountActive: setAccountActiveHandler,
    removingAccountLoading,
    removingAccountError,
    setAccountActiveLoading,
    setAccountActiveError,
  };
};
