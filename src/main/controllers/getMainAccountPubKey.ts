import { GetMainAccountPubKeyResponse } from 'models/api';

import { getMainSystemAccountKeypair } from '../node/helpers';

const mainAccountPubKey = async (): Promise<GetMainAccountPubKeyResponse> => {
  const mainSystemAccount = await getMainSystemAccountKeypair();
  const pubkey = mainSystemAccount.publicKey.toBase58();
  return pubkey;
};

export default mainAccountPubKey;
