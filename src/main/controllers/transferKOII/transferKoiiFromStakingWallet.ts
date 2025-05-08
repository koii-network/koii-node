import { Event } from 'electron';

// eslint-disable-next-line @cspell/spellchecker
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@_koii/web3.js';
import {
  TASK_CONTRACT_ID,
  TASK_INSTRUCTION_LAYOUTS,
  encodeData,
  padStringWithSpaces,
} from '@koii-network/task-node';
import {
  DUMMY_ACTIVE_TASK_FOR_STAKING_KEY_WITHDRAWAL,
  STAKE_POT_ACCOUNT_FOR_STAKING_KEY_WITHDRAWAL,
} from 'config/node';
import sdk from 'main/services/sdk';
import { sleep } from 'main/util';
import { TransferKoiiParam } from 'models';
import { throwTransactionError } from 'utils/error';

import { getWalletKeyPairByType } from '../../node/helpers';

import { transferKoiiFromMainWallet } from './transferKoiiFromMainWallet';

const TRANSACTION_FINALITY_WAIT = 1000;

export const transferKoiiFromStakingWallet = async (
  _: Event,
  payload: TransferKoiiParam
): Promise<void> => {
  const { accountName, amount, toWalletAddress } = payload;
  const mainSystemAccount = await getWalletKeyPairByType('main', accountName);
  const stakingAccount = await getWalletKeyPairByType('staking', accountName);

  try {
    console.log('Transferring funds from staking wallet');

    const accountInfo = await sdk.k2Connection.getAccountInfo(
      new PublicKey(stakingAccount.publicKey)
    );
    const stakingKeyIsCorrectlyOwned =
      accountInfo?.owner?.toBase58() === TASK_CONTRACT_ID.toBase58();

    if (stakingKeyIsCorrectlyOwned) {
      const stakeInstruction = getStakeInstruction(stakingAccount, amount);
      const unstakeInstruction = getUnstakeInstruction(stakingAccount);
      const claimInstruction = getClaimInstruction(
        stakingAccount,
        toWalletAddress
      );

      const transaction = new Transaction()
        .add(stakeInstruction)
        .add(unstakeInstruction)
        .add(claimInstruction);

      await sendAndConfirmTransaction(sdk.k2Connection, transaction, [
        mainSystemAccount,
        stakingAccount,
      ]);

      console.log('Transferred funds from staking wallet');
      sleep(TRANSACTION_FINALITY_WAIT);
    } else {
      await transferKoiiFromMainWallet({} as Event, {
        accountName,
        amount,
        toWalletAddress,
      });
    }
  } catch (e: any) {
    console.error(e);
    throwTransactionError(e);
  }
};

const getStakeInstruction = (
  stakingAccKeypair: Keypair,
  stakeAmount: number
) => {
  const data = encodeData(TASK_INSTRUCTION_LAYOUTS.Stake, {
    stakeAmount: stakeAmount * LAMPORTS_PER_SOL,
    ipAddress: new TextEncoder().encode(padStringWithSpaces('', 64)),
  });

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(DUMMY_ACTIVE_TASK_FOR_STAKING_KEY_WITHDRAWAL),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: stakingAccKeypair.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: new PublicKey(STAKE_POT_ACCOUNT_FOR_STAKING_KEY_WITHDRAWAL),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: TASK_CONTRACT_ID,
    data,
  });

  return instruction;
};

const getUnstakeInstruction = (stakingAccKeypair: Keypair) => {
  const data = encodeData(TASK_INSTRUCTION_LAYOUTS.Withdraw, {});

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(DUMMY_ACTIVE_TASK_FOR_STAKING_KEY_WITHDRAWAL),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: stakingAccKeypair.publicKey,
        isSigner: true,
        isWritable: true,
      },
      { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: TASK_CONTRACT_ID,
    data,
  });

  return instruction;
};

const getClaimInstruction = (
  stakingAccKeypair: Keypair,
  toWalletAddress: string
) => {
  const taskStateInfoPublicKey = new PublicKey(
    DUMMY_ACTIVE_TASK_FOR_STAKING_KEY_WITHDRAWAL
  );
  const data = encodeData(TASK_INSTRUCTION_LAYOUTS.ClaimReward, {});
  const beneficiaryAccount = new PublicKey(toWalletAddress);

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: taskStateInfoPublicKey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: stakingAccKeypair.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: new PublicKey(STAKE_POT_ACCOUNT_FOR_STAKING_KEY_WITHDRAWAL),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: beneficiaryAccount, isSigner: false, isWritable: true },
    ],
    programId: TASK_CONTRACT_ID,
    data,
  });

  return instruction;
};
