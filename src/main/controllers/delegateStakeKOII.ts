import { Event } from 'electron';

import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@_koii/web3.js';
import {
  KPL_PROGRAM_ID,
  TASK_CONTRACT_ID,
  TASK_INSTRUCTION_LAYOUTS,
  encodeData,
  padStringWithSpaces,
} from '@koii-network/task-node';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import sdk from 'main/services/sdk';
import {
  getTaskDataFromCache,
  saveStakeRecordToCache,
} from 'main/services/tasks-cache-utils';
import { sendAndDoubleConfirmTransaction, sleep } from 'main/util';
import { DelegateStakeParam, DelegateStakeResponse } from 'models';
import { getRoeFromKoii } from 'utils';
import { throwTransactionError } from 'utils/error';

import {
  getKplStakingAccountKeypair,
  getMainSystemAccountKeypair,
  getStakingAccountKeypair,
} from '../node/helpers';

import { getInitializedStakingAccounts } from './getInitializedStakingAccounts';
import { storeInitializedStakingAccounts } from './storeInitializedStakingAccounts';

const TRANSACTION_FINALITY_WAIT = 8000;

export const delegateStakeKOII = async (
  _: Event,
  payload: DelegateStakeParam
): Promise<DelegateStakeResponse> => {
  const {
    taskAccountPubKey,
    stakeAmount,
    isNetworkingTask,
    useStakingWallet,
    stakePotAccount,
    skipIfItIsAlreadyStaked,
  } = payload;

  const mainSystemAccount = await getMainSystemAccountKeypair();
  const stakingAccKeypair = await getStakingAccountKeypair();

  const initializeKPLStakingAccount = async () => {
    const kplStakingAccKeypair = await getKplStakingAccountKeypair();
    const kplStakingAccPublicKey = kplStakingAccKeypair.publicKey.toBase58();

    // Check if KPL staking account is already initialized
    const initializedStakingAccounts = await getInitializedStakingAccounts();
    const isKPLStakingAccountInitialized =
      initializedStakingAccounts[kplStakingAccPublicKey];

    if (!isKPLStakingAccountInitialized) {
      const kplStakingAccountInfo = await sdk.k2Connection.getAccountInfo(
        new PublicKey(kplStakingAccKeypair.publicKey)
      );

      const kplStakingAccountIsCorrectlyOwnedByTaskProgram =
        kplStakingAccountInfo?.owner?.toBase58() === KPL_PROGRAM_ID;

      console.log({ kplStakingAccountIsCorrectlyOwnedByTaskProgram });

      if (kplStakingAccountIsCorrectlyOwnedByTaskProgram) {
        await storeInitializedStakingAccounts({} as Event, {
          publicKey: kplStakingAccPublicKey,
          isInitialized: true,
        });
      } else {
        const createKPLStakingAccountInstruction = new TransactionInstruction(
          SystemProgram.createAccount({
            fromPubkey: mainSystemAccount.publicKey,
            newAccountPubkey: kplStakingAccKeypair.publicKey,
            lamports:
              (await sdk.k2Connection.getMinimumBalanceForRentExemption(1000)) +
              10000,
            space: 100,
            programId: new PublicKey(KPL_PROGRAM_ID),
          })
        );

        const kplTransaction = new Transaction().add(
          createKPLStakingAccountInstruction
        );

        try {
          await sendAndDoubleConfirmTransaction(
            sdk.k2Connection,
            kplTransaction,
            [mainSystemAccount, kplStakingAccKeypair]
          );
          await storeInitializedStakingAccounts({} as Event, {
            publicKey: kplStakingAccPublicKey,
            isInitialized: true,
          });
          console.log('KPL staking account initialized successfully');
        } catch (error) {
          console.log('KPL staking account not initialized:', error);
        }
      }
    }
  };

  const prepareMainStakingTransaction = async () => {
    const stakeDataInCache = await getTaskDataFromCache(
      taskAccountPubKey,
      'stakeList'
    );
    const stakeAmountInCache =
      stakeDataInCache?.stake_list?.[stakingAccKeypair.publicKey.toBase58()];
    const canSkipUnstakingSafely =
      skipIfItIsAlreadyStaked && stakeAmountInCache;

    if (canSkipUnstakingSafely) {
      return String(stakeAmountInCache);
    }

    const stakingAccountInfo = await sdk.k2Connection.getAccountInfo(
      new PublicKey(stakingAccKeypair.publicKey)
    );

    console.log('ACCOUNT OWNER', stakingAccountInfo?.owner?.toBase58());

    const stakingAccountIsCorrectlyOwnedByTaskProgram =
      stakingAccountInfo?.owner?.toBase58() === TASK_CONTRACT_ID.toBase58();

    if (!stakingAccountIsCorrectlyOwnedByTaskProgram && useStakingWallet) {
      throw new Error(
        'You can not stake directly from staking wallet because it is not initialized,'
      );
    }

    const getTransferToStakingKeyInstruction = () =>
      SystemProgram.transfer({
        fromPubkey: mainSystemAccount.publicKey,
        toPubkey: stakingAccKeypair.publicKey,
        lamports: stakeAmount * LAMPORTS_PER_SOL,
      });

    const getCreateStakingAccountInstruction = async () =>
      new TransactionInstruction(
        SystemProgram.createAccount({
          fromPubkey: mainSystemAccount.publicKey,
          newAccountPubkey: stakingAccKeypair.publicKey,
          lamports:
            stakeAmount * LAMPORTS_PER_SOL +
            (await sdk.k2Connection.getMinimumBalanceForRentExemption(1000)) +
            10000, // Adding 10,000 extra lamports for padding
          space: 100,
          programId: TASK_CONTRACT_ID,
        })
      );

    const fundingInstruction = stakingAccountIsCorrectlyOwnedByTaskProgram
      ? getTransferToStakingKeyInstruction()
      : await getCreateStakingAccountInstruction();

    const subdomain = await namespaceInstance.storeGet('subdomain');
    const subdomainToEncode =
      isNetworkingTask && subdomain ? `http://${subdomain}` : '';

    const stakeInstructionData = encodeData(TASK_INSTRUCTION_LAYOUTS.Stake, {
      stakeAmount: stakeAmount * LAMPORTS_PER_SOL,
      ipAddress: new TextEncoder().encode(
        padStringWithSpaces(subdomainToEncode, 64)
      ),
    });

    const stakeInstruction = new TransactionInstruction({
      keys: [
        {
          pubkey: new PublicKey(taskAccountPubKey),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: stakingAccKeypair.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(stakePotAccount),
          isSigner: false,
          isWritable: true,
        },
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: TASK_CONTRACT_ID,
      data: stakeInstructionData,
    });

    const instructions = [
      ...(!useStakingWallet ? [fundingInstruction] : []),
      stakeInstruction,
    ];

    const transaction = new Transaction().add(...instructions);

    return sendAndDoubleConfirmTransaction(sdk.k2Connection, transaction, [
      mainSystemAccount,
      stakingAccKeypair,
    ]);
  };

  const [kplResult, mainStakingResult] = await Promise.allSettled([
    initializeKPLStakingAccount(),
    prepareMainStakingTransaction(),
  ]);

  if (mainStakingResult.status === 'fulfilled') {
    await saveStakeRecordToCache(
      taskAccountPubKey,
      stakingAccKeypair.publicKey.toBase58(),
      getRoeFromKoii(stakeAmount),
      true
    );

    await sleep(TRANSACTION_FINALITY_WAIT);

    const { value } = mainStakingResult;
    console.log(
      `Successfully staked ${stakeAmount} KOII into the task ${taskAccountPubKey} from KOII staking account ${stakingAccKeypair.publicKey.toBase58()}`
    );
    return typeof value === 'string' ? value : value.signature;
  } else {
    console.error('Staking operation failed:', mainStakingResult.reason);
    return throwTransactionError(mainStakingResult.reason);
  }
};
