import fs from 'fs';

import { Keypair } from '@_koii/web3.js';
import {
  IDatabase,
  TaskNodeBase,
  TaskNodeConfig,
} from '@koii-network/task-node';

import { SystemDbKeys } from '../config/systemDbKeys';

import { getAppDataPath } from './node/helpers/getAppDataPath';

export class NodeNamespace extends TaskNodeBase {
  appDataPath: string;

  constructor(config: TaskNodeConfig) {
    super(config);

    this.appDataPath = getAppDataPath();
  }

  async getMainSystemAccountPubKey(db?: IDatabase): Promise<Keypair> {
    if (!db) throw new Error('No database provided');

    const activeAccount = await db.get(SystemDbKeys.ActiveAccount);

    if (!activeAccount) {
      throw new Error('No active account found');
    }

    const mainSystemAccountRetrieved = Keypair.fromSecretKey(
      Uint8Array.from(
        JSON.parse(
          fs.readFileSync(
            `${this.appDataPath}/wallets/${activeAccount}_mainSystemWallet.json`,
            'utf-8'
          )
        ) as Uint8Array
      )
    );

    return mainSystemAccountRetrieved;
  }

  async getSubmitterAccount(taskType?: string): Promise<Keypair | null> {
    let submitterAccount: Keypair | null;
    if (!taskType) {
      // eslint-disable-next-line no-param-reassign
      taskType = this.taskType;
    }
    try {
      const activeAccount = await this.storeGetRaw(SystemDbKeys.ActiveAccount);
      const STAKING_WALLET_PATH =
        taskType === 'KOII'
          ? `${getAppDataPath()}/namespace/${activeAccount}_stakingWallet.json`
          : `${getAppDataPath()}/namespace/${activeAccount}_kplStakingWallet.json`;
      if (!fs.existsSync(STAKING_WALLET_PATH)) return null;
      submitterAccount = Keypair.fromSecretKey(
        Uint8Array.from(
          JSON.parse(
            fs.readFileSync(STAKING_WALLET_PATH, 'utf-8')
          ) as Uint8Array
        )
      );
    } catch (e) {
      console.error(
        'Staking wallet not found. Please create a staking wallet and place it in the namespace folder'
      );
      submitterAccount = null;
    }
    return submitterAccount;
  }

  async getDistributionAccount(): Promise<Keypair | null> {
    let distributionAccount: Keypair | null;

    try {
      const activeAccount = await this.storeGetRaw(SystemDbKeys.ActiveAccount);
      const STAKING_WALLET_PATH =
        this.taskType === 'KOII'
          ? `${getAppDataPath()}/namespace/${activeAccount}_stakingWallet.json`
          : `${getAppDataPath()}/namespace/${activeAccount}_kplStakingWallet.json`;
      if (!fs.existsSync(STAKING_WALLET_PATH)) return null;
      distributionAccount = Keypair.fromSecretKey(
        Uint8Array.from(
          JSON.parse(
            fs.readFileSync(STAKING_WALLET_PATH, 'utf-8')
          ) as Uint8Array
        )
      );
    } catch (e) {
      console.error(
        'Distribution wallet not found. Please create a staking wallet and place it in the namespace folder'
      );
      distributionAccount = null;
    }
    return distributionAccount;
  }
}
