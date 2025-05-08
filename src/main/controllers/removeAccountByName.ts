import { Event } from 'electron';
import fs from 'fs';

import { RemoveAccountByNameParam } from 'models/api';

import { ErrorType } from '../../models';
import { throwDetailedError } from '../../utils';
import { getAppDataPath } from '../node/helpers/getAppDataPath';

const removeAccountByName = async (
  event: Event,
  payload: RemoveAccountByNameParam
): Promise<boolean> => {
  const { accountName } = payload;
  try {
    const stakingPath = `${getAppDataPath()}/namespace/${accountName}_stakingWallet.json`;
    const kplStakingPath = `${getAppDataPath()}/namespace/${accountName}_kplStakingWallet.json`;
    const mainWalletPath = `${getAppDataPath()}/wallets/${accountName}_mainSystemWallet.json`;

    if (fs.existsSync(stakingPath)) {
      fs.unlinkSync(stakingPath);
    }

    if (fs.existsSync(kplStakingPath)) {
      fs.unlinkSync(kplStakingPath);
    }

    if (fs.existsSync(mainWalletPath)) {
      fs.unlinkSync(mainWalletPath);
    }

    return true;
  } catch (err: any) {
    console.log('ERROR REMOVE ACCOUNT', err);
    return throwDetailedError({
      detailed: err,
      type: ErrorType.GENERIC,
    });
  }
};

export default removeAccountByName;
