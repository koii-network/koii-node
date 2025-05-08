import { useQuery } from 'react-query';

import { QueryKeys, getMainAccountPublicKey } from 'renderer/services';

export const useMainAccount = () => {
  return useQuery([QueryKeys.MainAccount], getMainAccountPublicKey);
};
