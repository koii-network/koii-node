import { Event } from 'electron';

import { GetStakingAccountPubKeyResponse } from 'models';

import { getKplStakingAccountKeypair } from '../node/helpers';

export const getKPLStakingAccountPubKey = async (
  event?: Event
): Promise<GetStakingAccountPubKeyResponse> => {
  const kplStakingAccount = await getKplStakingAccountKeypair();
  return kplStakingAccount.publicKey.toBase58();
};
