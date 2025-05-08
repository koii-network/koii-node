import { CheckWalletExistsResponse } from 'models/api';

import {
  getMainSystemAccountKeypair,
  getStakingAccountKeypair,
} from '../node/helpers';

const checkWallet = async (): Promise<CheckWalletExistsResponse> => {
  let mainSystemAccount = false;
  let stakingWallet = false;

  try {
    await getMainSystemAccountKeypair();
    mainSystemAccount = true;
  } catch (err) {
    /* empty */
  }

  try {
    await getStakingAccountKeypair();
    stakingWallet = true;
  } catch (err) {
    /* empty */
  }

  const check = {
    mainSystemAccount,
    stakingWallet,
  };
  return check;
};

export default checkWallet;
