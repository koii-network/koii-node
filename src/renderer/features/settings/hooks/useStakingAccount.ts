import { useQuery } from 'react-query';

import { QueryKeys, getStakingAccountPublicKey } from 'renderer/services';

export const useStakingAccount = () => {
  return useQuery(QueryKeys.StakingAccount, getStakingAccountPublicKey);
};
