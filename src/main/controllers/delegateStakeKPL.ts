import { Event } from 'electron';

import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@_koii/web3.js';
import {
  KPL_CONTRACT_ID,
  KPL_PROGRAM_ID,
  TASK_CONTRACT_ID,
  TASK_INSTRUCTION_LAYOUTS_KPL,
  encodeData,
  padStringWithSpaces,
} from '@koii-network/task-node';
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import sdk from 'main/services/sdk';
import {
  getTaskDataFromCache,
  saveStakeRecordToCache,
} from 'main/services/tasks-cache-utils';
import {
  getKPLDigits,
  sendAndDoubleConfirmTransaction,
  sleep,
} from 'main/util';
import { DelegateStakeParam, DelegateStakeResponse } from 'models';
import { throwTransactionError } from 'utils/error';

import {
  getKplStakingAccountKeypair,
  getMainSystemAccountKeypair,
  getStakingAccountKeypair,
} from '../node/helpers';

import { getInitializedStakingAccounts } from './getInitializedStakingAccounts';
import { storeInitializedStakingAccounts } from './storeInitializedStakingAccounts';

const TRANSACTION_FINALITY_WAIT = 8000;

export const delegateStakeKPL = async (
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
    mintAddress,
  } = payload;

  console.log({ payload });

  const mainSystemAccount = await getMainSystemAccountKeypair();
  const kplStakingAccKeypair = await getKplStakingAccountKeypair();

  const digits = await getKPLDigits(mintAddress || '', sdk.k2Connection);
  const amountToStake = stakeAmount * 10 ** digits;

  const initializeKOIIStakingAccount = async () => {
    const stakingAccKeypair = await getStakingAccountKeypair();
    const stakingAccPublicKey = stakingAccKeypair.publicKey.toBase58();

    // Check if KOII staking account is already initialized
    const initializedStakingAccounts = await getInitializedStakingAccounts();
    const isStakingAccountInitialized =
      initializedStakingAccounts[stakingAccPublicKey];

    if (!isStakingAccountInitialized) {
      const stakingAccountInfo = await sdk.k2Connection.getAccountInfo(
        new PublicKey(stakingAccKeypair.publicKey)
      );

      const stakingAccountIsCorrectlyOwnedByTaskProgram =
        stakingAccountInfo?.owner?.toBase58() === TASK_CONTRACT_ID.toBase58();

      console.log({ stakingAccountIsCorrectlyOwnedByTaskProgram });

      if (stakingAccountIsCorrectlyOwnedByTaskProgram) {
        await storeInitializedStakingAccounts({} as Event, {
          publicKey: stakingAccPublicKey,
          isInitialized: true,
        });
      } else {
        const createStakingAccountInstruction = new TransactionInstruction(
          SystemProgram.createAccount({
            fromPubkey: mainSystemAccount.publicKey,
            newAccountPubkey: stakingAccKeypair.publicKey,
            lamports:
              (await sdk.k2Connection.getMinimumBalanceForRentExemption(1000)) +
              10000,
            space: 100,
            programId: TASK_CONTRACT_ID,
          })
        );

        const koiiTransaction = new Transaction().add(
          createStakingAccountInstruction
        );

        try {
          await sendAndDoubleConfirmTransaction(
            sdk.k2Connection,
            koiiTransaction,
            [mainSystemAccount, stakingAccKeypair]
          );
          await storeInitializedStakingAccounts({} as Event, {
            publicKey: stakingAccPublicKey,
            isInitialized: true,
          });
          console.log('KOII staking account initialized successfully');
        } catch (error) {
          console.log('KOII staking account not initialized:', error);
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
      stakeDataInCache?.stake_list?.[kplStakingAccKeypair.publicKey.toBase58()];
    const canSkipUnstakingSafely =
      skipIfItIsAlreadyStaked && stakeAmountInCache;

    if (canSkipUnstakingSafely) {
      return String(stakeAmountInCache);
    }

    const kplStakingAccountInfo = await sdk.k2Connection.getAccountInfo(
      new PublicKey(kplStakingAccKeypair.publicKey)
    );

    console.log('KPL ACCOUNT OWNER', kplStakingAccountInfo?.owner?.toBase58());

    const stakingAccountIsCorrectlyOwnedByTaskProgram =
      kplStakingAccountInfo?.owner?.toBase58() === KPL_PROGRAM_ID;

    if (!stakingAccountIsCorrectlyOwnedByTaskProgram && useStakingWallet) {
      throw new Error(
        'You can not stake directly from KPL staking wallet because it is not initialized,'
      );
    }

    const rentExcemptionLamports =
      (await sdk.k2Connection.getMinimumBalanceForRentExemption(1000)) + 10000; // Adding 10,000 extra lamports for padding

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      sdk.k2Connection as any,
      mainSystemAccount as any,
      new PublicKey(mintAddress || '') as any,
      mainSystemAccount.publicKey as any
    );

    if (!fromTokenAccount || !fromTokenAccount.address) {
      throw new Error('Failed to get or create fromTokenAccount');
    }

    const kplAssociatedAccount = await getOrCreateAssociatedTokenAccount(
      sdk.k2Connection as any,
      mainSystemAccount as any,
      new PublicKey(mintAddress || '') as any,
      kplStakingAccKeypair.publicKey as any
    );

    const transferToStakingKeyInstruction = createTransferInstruction(
      fromTokenAccount.address,
      kplAssociatedAccount.address,
      mainSystemAccount.publicKey as any,
      amountToStake,
      undefined
    );

    const createStakingAccountInstruction = new TransactionInstruction(
      SystemProgram.createAccount({
        fromPubkey: mainSystemAccount.publicKey,
        newAccountPubkey: kplStakingAccKeypair.publicKey,
        lamports: rentExcemptionLamports,
        space: 100,
        programId: new PublicKey(KPL_PROGRAM_ID),
      })
    );

    const subdomain = await namespaceInstance.storeGet('subdomain');
    const subdomainToEncode =
      isNetworkingTask && subdomain ? `http://${subdomain}` : '';

    const stakeInstructionData = encodeData(
      TASK_INSTRUCTION_LAYOUTS_KPL.Stake,
      {
        stakeAmount: amountToStake,
        ipAddress: new TextEncoder().encode(
          padStringWithSpaces(subdomainToEncode, 64)
        ),
      }
    );

    const stakeInstruction = new TransactionInstruction({
      keys: [
        {
          pubkey: new PublicKey(taskAccountPubKey),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: kplStakingAccKeypair.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: kplAssociatedAccount.address,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(stakePotAccount),
          isSigner: false,
          isWritable: true,
        },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: KPL_CONTRACT_ID,
      data: stakeInstructionData,
    });

    const instructions = [
      ...(stakingAccountIsCorrectlyOwnedByTaskProgram
        ? []
        : [createStakingAccountInstruction]),
      transferToStakingKeyInstruction,
      stakeInstruction,
    ];

    const transaction = new Transaction().add(...instructions);

    return sendAndDoubleConfirmTransaction(sdk.k2Connection, transaction, [
      mainSystemAccount,
      kplStakingAccKeypair,
    ]);
  };

  const [koiiResult, mainStakingResult] = await Promise.allSettled([
    initializeKOIIStakingAccount(),
    prepareMainStakingTransaction(),
  ]);

  if (mainStakingResult.status === 'fulfilled') {
    await saveStakeRecordToCache(
      taskAccountPubKey,
      kplStakingAccKeypair.publicKey.toBase58(),
      amountToStake,
      true
    );

    await sleep(TRANSACTION_FINALITY_WAIT);

    const { value } = mainStakingResult;
    console.log(
      `Successfully staked ${amountToStake} of token ${mintAddress} into the task ${taskAccountPubKey} from KPL staking account ${kplStakingAccKeypair.publicKey.toBase58()}`
    );
    return typeof value === 'string' ? value : value.signature;
  } else {
    console.error('Staking operation failed:', mainStakingResult.reason);
    return throwTransactionError(mainStakingResult.reason);
  }
};
