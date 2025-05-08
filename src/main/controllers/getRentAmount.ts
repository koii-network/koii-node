import { PublicKey } from '@_koii/web3.js';
import { getStakingAccountKeypair } from 'main/node/helpers';
import sdk from 'main/services/sdk';

export const getRentAmount = async (): Promise<number> => {
  const stakingAccKeypair = await getStakingAccountKeypair();

  const accountInfo = await sdk.k2Connection.getAccountInfo(
    new PublicKey(stakingAccKeypair.publicKey)
  );

  const accountDataSize = accountInfo?.data?.byteLength;

  if (accountDataSize) {
    if (accountDataSize < 2000000) return 0.1;
    else if (accountDataSize < 20000000) return 1;
    else return 2.39;
  } else {
    return 1;
  }
};
