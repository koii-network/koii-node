import { Event } from 'electron';

import { GetStakingAccountPubKeyResponse } from 'models';

import { getStakingAccountKeypair } from '../node/helpers';

const stakingAccountPubKey = async (
  event?: Event
): Promise<GetStakingAccountPubKeyResponse> => {
  const stakingAccount = await getStakingAccountKeypair();
  return stakingAccount.publicKey.toBase58();
};

export default stakingAccountPubKey;
