import { useCallback } from 'react';

import {
  getKPLStakingAccountPubKey,
  getMainAccountPublicKey,
  triggerRedemption,
} from 'renderer/services';

export const useRentExemptionFlow = () => {
  const getStakingWalletAirdrop = useCallback(async () => {
    const [mainWallet, stakingWallet] = await Promise.all([
      getMainAccountPublicKey(),
      getKPLStakingAccountPubKey(),
    ]);

    if (!mainWallet) {
      throw new Error('No main wallet found');
    }

    if (!stakingWallet) {
      throw new Error('No staking wallet found');
    }

    const response = await triggerRedemption({ mainWallet, stakingWallet });
    return response;
  }, []);

  return { getStakingWalletAirdrop };
};
