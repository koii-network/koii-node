import {
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@_koii/web3.js';
import { TASK_CONTRACT_ID } from '@koii-network/task-node';
import {
  getMainSystemAccountKeypair,
  getStakingAccountKeypair,
} from 'main/node/helpers';
import sdk from 'main/services/sdk';
import { throwTransactionError } from 'utils/error';

const SAFE_AMOUNT_FOR_FEES = 3000000;

export const recoverStakingAccount = async (_: Event) => {
  try {
    console.log('Recovering staking account');
    const mainSystemAccount = await getMainSystemAccountKeypair();
    const stakingAccount = await getStakingAccountKeypair();
    const accountInfo = await sdk.k2Connection.getAccountInfo(
      stakingAccount.publicKey
    );

    const mainAccountBalance = await sdk.k2Connection.getBalance(
      mainSystemAccount.publicKey
    );
    let stakingAccountBalance = await sdk.k2Connection.getBalance(
      stakingAccount.publicKey
    );
    const mainAccountNeedsFundsToAffordFees =
      mainAccountBalance < SAFE_AMOUNT_FOR_FEES;
    const amountMissingForFees = SAFE_AMOUNT_FOR_FEES - mainAccountBalance;

    console.log({
      mainAccountBalance,
      stakingAccountBalance,
      stakingAccountOwner: accountInfo?.owner.toBase58(),
      amountMissingForFees,
    });

    const isOwnedByTaskProgram =
      accountInfo?.owner?.toBase58() === TASK_CONTRACT_ID.toBase58();
    if (isOwnedByTaskProgram) {
      console.log(
        'Staking account is correctly owned by the Task Program, aborting recovery flow'
      );
      return;
    }

    if (mainAccountNeedsFundsToAffordFees) {
      console.log("Funding main account for recovery flow's fees");
      const fundMainAccountForFeesTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: stakingAccount.publicKey,
          toPubkey: mainSystemAccount.publicKey,
          lamports: amountMissingForFees,
        })
      );

      await sendAndConfirmTransaction(
        sdk.k2Connection,
        fundMainAccountForFeesTransaction,
        [stakingAccount]
      );
      console.log("Successfully funded main account for recovery flow's fees");

      stakingAccountBalance = await sdk.k2Connection.getBalance(
        stakingAccount.publicKey
      );
    }

    const depleteStakingAccountInstruction = SystemProgram.transfer({
      fromPubkey: stakingAccount.publicKey,
      toPubkey: mainSystemAccount.publicKey,
      lamports: stakingAccountBalance,
    });

    const recommendedMinimumBalanceForStakingAccount =
      (await sdk.k2Connection.getMinimumBalanceForRentExemption(1000)) + 10000; // Adding 10,000 extra lamports for padding
    const availableBalance =
      stakingAccountBalance + mainAccountBalance - SAFE_AMOUNT_FOR_FEES;
    const amountToFundStakingWalletWith =
      availableBalance < recommendedMinimumBalanceForStakingAccount
        ? availableBalance
        : recommendedMinimumBalanceForStakingAccount;

    const makeItOwnedByTaskProgramInstruction = SystemProgram.createAccount({
      fromPubkey: mainSystemAccount.publicKey,
      newAccountPubkey: stakingAccount.publicKey,
      lamports: amountToFundStakingWalletWith,
      space: 100,
      programId: TASK_CONTRACT_ID,
    });

    const recoverStakingAccountTransaction = new Transaction({
      feePayer: mainSystemAccount.publicKey,
    }).add(
      depleteStakingAccountInstruction,
      makeItOwnedByTaskProgramInstruction
    );

    console.log('Sending recovery transaction');

    await sendAndConfirmTransaction(
      sdk.k2Connection,
      recoverStakingAccountTransaction,
      [mainSystemAccount, stakingAccount]
    );
    console.log('Recovered staking account');
  } catch (e) {
    console.error(e);
    throwTransactionError(e);
  }
};
