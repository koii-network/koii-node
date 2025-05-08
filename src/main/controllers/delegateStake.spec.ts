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

import delegateStake from './delegateStake';

jest.spyOn(koiiWeb3, 'sendAndConfirmTransaction');
jest.spyOn(koiiWeb3.SystemProgram, 'createAccount');
jest.spyOn(koiiWeb3.SystemProgram, 'transfer');

jest.mock('main/node/helpers/Namespace', () => ({
  namespaceInstance: {
    storeGet: jest.fn(),
    storeSet: jest.fn(),
  },
}));
jest.mock('../node/helpers', () => ({
  __esModule: true,
  getMainSystemAccountKeypair: jest.fn(),
  getStakingAccountKeypair: jest.fn(),
}));
jest.mock('main/services/tasks-cache-utils', () => ({
  getTaskDataFromCache: jest.fn().mockImplementation(() => Promise.resolve()),
  saveStakeRecordToCache: jest.fn(),
}));
jest.mock('main/services/sdk', () => ({
  k2Connection: {
    getAccountInfo: jest.fn(),
    getMinimumBalanceForRentExemption: jest.fn().mockReturnValue(3000),
  },
}));
jest.mock('./getTaskInfo', () => ({
  __esModule: true,
  getTaskInfo: jest.fn(),
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

  describe('account already exists', () => {
    beforeEach(() => {
      (sdk.k2Connection.getAccountInfo as jest.Mock).mockReturnValue({
        owner: {
          toBase58: jest.fn().mockReturnValue(TASK_CONTRACT_ID.toBase58()),
        },
      });
    });

    it('sends stake and does not create new account', async () => {
      const exampleAddress = '7x8tP5ipyqPfrRSXoxgGz6EzfTe3S84J3WUvJwbTwgnY';
      const payload: any = {
        taskAccountPubKey: new koiiWeb3.PublicKey(exampleAddress),
        stakeAmount: 1000,
        stakePotAccount: 'Ai5QY8EwZiZ9HPgYTs6QjqyffKxEGF5H9jN11YYWyxwG',
      };

      const result = await delegateStake({} as Event, payload);

      const systemProgramTransferPayload = {
        fromPubkey: mainSystemAccount.publicKey,
        toPubkey: stakingAccKeypair.publicKey,
        lamports: 1000 * koiiWeb3.LAMPORTS_PER_SOL,
      };

      expect(koiiWeb3.SystemProgram.createAccount).not.toHaveBeenCalled();
      expect(koiiWeb3.SystemProgram.transfer).toHaveBeenCalledWith(
        systemProgramTransferPayload
      );
      expect(koiiWeb3.sendAndConfirmTransaction).toHaveBeenCalledTimes(1);
      expect(result).toBe('example_transaction_hash');
    });
  });

  describe('account does not exist', () => {
    beforeEach(() => {
      (sdk.k2Connection.getAccountInfo as jest.Mock).mockReturnValue({
        owner: {
          toBase58: jest.fn().mockReturnValue('not_task_contract_id'),
        },
      });
    });

    it('sends stake and creates new account', async () => {
      const exampleAddress = '7x8tP5ipyqPfrRSXoxgGz6EzfTe3S84J3WUvJwbTwgnY';
      const payload: any = {
        taskAccountPubKey: new koiiWeb3.PublicKey(exampleAddress),
        stakeAmount: 1000,
        stakePotAccount: 'Ai5QY8EwZiZ9HPgYTs6QjqyffKxEGF5H9jN11YYWyxwG',
      };

      const result = await delegateStake({} as Event, payload);

      const systemProgramCreateAccountPayload = {
        fromPubkey: mainSystemAccount.publicKey,
        newAccountPubkey: stakingAccKeypair.publicKey,
        lamports: 1000 * koiiWeb3.LAMPORTS_PER_SOL + 3000 + 10000,
        space: 100,
        programId: TASK_CONTRACT_ID,
      };

      expect(koiiWeb3.SystemProgram.createAccount).toHaveBeenCalledWith(
        systemProgramCreateAccountPayload
      );
      expect(koiiWeb3.sendAndConfirmTransaction).toHaveBeenCalledTimes(1);
      expect(result).toBe('example_transaction_hash');
    });
  });
});
