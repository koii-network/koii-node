/**
 * @jest-environment node
 */

import * as koiiWeb3 from '@_koii/web3.js';
import { TASK_CONTRACT_ID } from '@koii-network/task-node';
import sdk from 'main/services/sdk';

import {
  getMainSystemAccountKeypair,
  getStakingAccountKeypair,
} from '../node/helpers';

import { creditStakingWalletFromMainWallet } from './creditStakingWalletFromMainWallet';

jest.spyOn(koiiWeb3, 'sendAndConfirmTransaction');
jest.spyOn(koiiWeb3.SystemProgram, 'createAccount');
jest.spyOn(koiiWeb3.SystemProgram, 'transfer');

jest.mock('../node/helpers', () => ({
  __esModule: true,
  getMainSystemAccountKeypair: jest.fn(),
  getStakingAccountKeypair: jest.fn(),
}));

jest.mock('main/services/sdk', () => ({
  k2Connection: {
    getAccountInfo: jest.fn(),
    getMinimumBalanceForRentExemption: jest.fn().mockReturnValue(3000),
  },
}));

describe('delegateStake', () => {
  let mainSystemAccount: any;
  let stakingAccKeypair: any;

  beforeAll(() => {
    (koiiWeb3.sendAndConfirmTransaction as jest.Mock).mockImplementation(() => {
      return 'example_transaction_hash';
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mainSystemAccount = koiiWeb3.Keypair.generate();
    stakingAccKeypair = koiiWeb3.Keypair.generate();

    (getMainSystemAccountKeypair as jest.Mock).mockReturnValue(
      mainSystemAccount
    );
    (getStakingAccountKeypair as jest.Mock).mockReturnValue(stakingAccKeypair);
  });

  describe('creditStakingWalletFromMainWallet', () => {
    beforeEach(() => {
      (sdk.k2Connection.getAccountInfo as jest.Mock).mockReturnValue({
        owner: {
          toBase58: jest.fn().mockReturnValue(TASK_CONTRACT_ID.toBase58()),
        },
      });
    });

    it('transfers given Roe amount from main account to staking account', async () => {
      const amountInRoe = 5 * 1e9;
      const result = await creditStakingWalletFromMainWallet({} as Event, {
        amountInRoe,
      });

      expect(result).toEqual('example_transaction_hash');

      expect(koiiWeb3.SystemProgram.transfer).toHaveBeenCalledWith({
        fromPubkey: mainSystemAccount.publicKey,
        toPubkey: stakingAccKeypair.publicKey,
        lamports: amountInRoe,
      });

      expect(koiiWeb3.SystemProgram.transfer).toHaveBeenCalledTimes(1);
    });
  });
});
