import { Event } from 'electron';

// eslint-disable-next-line @cspell/spellchecker
import { PublicKey, Transaction, TransactionInstruction } from '@_koii/web3.js';
import { KPL_PROGRAM_ID } from '@koii-network/task-node';
import { sha256 } from '@noble/hashes/sha256';
import { struct, u8 } from '@solana/buffer-layout';
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import koiiTasks from 'main/services/koiiTasks';
import sdk from 'main/services/sdk';
import { savePendingRewardsRecordToCache } from 'main/services/tasks-cache-utils';
import { sendAndDoubleConfirmTransaction } from 'main/util';
import { ClaimRewardParam, ClaimRewardResponse, RawTaskData } from 'models';
import { throwTransactionError } from 'utils/error';

import {
  getKplStakingAccountKeypair,
  getMainSystemAccountKeypair,
} from '../node/helpers';

import { getTaskInfo } from './getTaskInfo';

export const claimRewardKPL = async (
  _: Event,
  payload: ClaimRewardParam & { tokenType: string; stakePotAccount?: string }
): Promise<ClaimRewardResponse> => {
  const { taskAccountPubKey, tokenType, stakePotAccount } = payload;

  try {
    const taskStateInfoPublicKey = new PublicKey(taskAccountPubKey);

    const kplStakingAccKeypair = await getKplStakingAccountKeypair();
    const mainSystemAccountKeyPair = await getMainSystemAccountKeypair();

    const taskStakePotAccount =
      stakePotAccount ||
      (await getTaskInfo({} as Event, { taskAccountPubKey })).stakePotAccount;

    const statePotPubKey = new PublicKey(taskStakePotAccount);
    const beneficiaryAssociateAccount = await getOrCreateAssociatedTokenAccount(
      sdk.k2Connection as any,
      mainSystemAccountKeyPair as any,
      new PublicKey(tokenType) as any,
      mainSystemAccountKeyPair.publicKey as any
    );

    console.log(`Claiming reward for task: ${taskAccountPubKey}`);

    const claimRewardInstruction = await getClaimRewardInstruction({
      taskState: taskStateInfoPublicKey,
      stakePot: statePotPubKey,
      claimer: kplStakingAccKeypair.publicKey,
      beneficiary: beneficiaryAssociateAccount.address,
    });

    const response = await sendAndDoubleConfirmTransaction(
      sdk.k2Connection,
      new Transaction().add(claimRewardInstruction),
      [mainSystemAccountKeyPair, kplStakingAccKeypair]
    );

    console.log(`Claimed reward for task: ${taskAccountPubKey}`);

    const getStartedTasksPubKeys =
      (await koiiTasks.getStartedTasksPubKeys()) || [];
    const taskIsStarted = getStartedTasksPubKeys.includes(taskAccountPubKey);

    if (taskIsStarted) {
      await savePendingRewardsRecordToCache(
        taskAccountPubKey,
        kplStakingAccKeypair.publicKey.toBase58(),
        0
      );

      koiiTasks.updateStartedTasksData(taskAccountPubKey, (taskData) => {
        const newTaskData: Omit<RawTaskData, 'is_running'> = {
          ...taskData,
          available_balances: {
            ...taskData.available_balances,
            [kplStakingAccKeypair.publicKey.toBase58()]: 0,
          },
        };
        return newTaskData;
      });
    }

    return response.signature;
  } catch (err: any) {
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack,
    });

    if (err.message?.includes('Transaction simulation failed')) {
      console.error('Transaction simulation failed. Details:', err.logs);
    }

    return throwTransactionError(err);
  }
};

interface Accounts {
  taskState: PublicKey;
  stakePot: PublicKey;
  claimer: PublicKey;
  beneficiary: PublicKey;
}
interface Data {
  instruction: number;
}

const DataLayout = struct<Data>([u8('instruction')]);

async function getClaimRewardInstruction(
  accounts: Accounts
): Promise<TransactionInstruction> {
  const data = Buffer.alloc(DataLayout.span);
  DataLayout.encode(
    {
      instruction: 7,
    },
    data
  );

  const seed = sha256(accounts.stakePot.toBase58());
  const [authorityPda, _bump] = await PublicKey.findProgramAddress(
    [seed],
    new PublicKey(KPL_PROGRAM_ID)
  );

  const keys = [
    { pubkey: accounts.taskState, isSigner: false, isWritable: true },
    { pubkey: accounts.claimer, isSigner: true, isWritable: true },
    { pubkey: accounts.stakePot, isSigner: false, isWritable: true },
    { pubkey: accounts.beneficiary, isSigner: false, isWritable: true },
    { pubkey: authorityPda, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: new PublicKey(KPL_PROGRAM_ID),
    data,
  });
}
