import {
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@_koii/web3.js';
import { KPL_CONTRACT_ID } from '@koii-network/task-node';
import {
  getKplStakingAccountKeypair,
  getMainSystemAccountKeypair,
} from 'main/node/helpers';
import sdk from 'main/services/sdk';
import { throwTransactionError } from 'utils/error';

const SAFE_AMOUNT_FOR_FEES = 3000000;

export const recoverKPLStakingAccount = async (_: Event) => {
  try {
    console.log('Recovering KPL staking account');
    const mainSystemAccount = await getMainSystemAccountKeypair();
    const kplStakingAccount = await getKplStakingAccountKeypair();
    const accountInfo = await sdk.k2Connection.getAccountInfo(
      kplStakingAccount.publicKey
    );

    const mainAccountBalance = await sdk.k2Connection.getBalance(
      mainSystemAccount.publicKey
    );
    let kplStakingAccountBalance = await sdk.k2Connection.getBalance(
      kplStakingAccount.publicKey
    );
    const mainAccountNeedsFundsToAffordFees =
      mainAccountBalance < SAFE_AMOUNT_FOR_FEES;
    const amountMissingForFees = SAFE_AMOUNT_FOR_FEES - mainAccountBalance;

    console.log({
      mainAccountBalance,
      kplStakingAccountBalance,
      kplStakingAccountOwner: accountInfo?.owner.toBase58(),
      amountMissingForFees,
    });

    const isOwnedByKPLProgram =
      accountInfo?.owner?.toBase58() === KPL_CONTRACT_ID.toBase58();
    if (isOwnedByKPLProgram) {
      console.log(
        'KPL staking account is correctly owned by the KPL Program, aborting recovery flow'
      );
      return;
    }

    if (mainAccountNeedsFundsToAffordFees) {
      console.log("Funding main account for recovery flow's fees");
      const fundMainAccountForFeesTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: kplStakingAccount.publicKey,
          toPubkey: mainSystemAccount.publicKey,
          lamports: amountMissingForFees,
        })
      );

      await sendAndConfirmTransaction(
        sdk.k2Connection,
        fundMainAccountForFeesTransaction,
        [kplStakingAccount]
      );
      console.log("Successfully funded main account for recovery flow's fees");

      kplStakingAccountBalance = await sdk.k2Connection.getBalance(
        kplStakingAccount.publicKey
      );
    }

    const depleteKplStakingAccountInstruction = SystemProgram.transfer({
      fromPubkey: kplStakingAccount.publicKey,
      toPubkey: mainSystemAccount.publicKey,
      lamports: kplStakingAccountBalance,
    });

    const recommendedMinimumBalanceForStakingAccount =
      (await sdk.k2Connection.getMinimumBalanceForRentExemption(1000)) + 10000; // Adding 10,000 extra lamports for padding
    const availableBalance =
      kplStakingAccountBalance + mainAccountBalance - SAFE_AMOUNT_FOR_FEES;
    const amountToFundKplStakingWalletWith =
      availableBalance < recommendedMinimumBalanceForStakingAccount
        ? availableBalance
        : recommendedMinimumBalanceForStakingAccount;

    const makeItOwnedByKPLProgramInstruction = SystemProgram.createAccount({
      fromPubkey: mainSystemAccount.publicKey,
      newAccountPubkey: kplStakingAccount.publicKey,
      lamports: amountToFundKplStakingWalletWith,
      space: 100,
      programId: KPL_CONTRACT_ID,
    });

    const recoverStakingAccountTransaction = new Transaction({
      feePayer: mainSystemAccount.publicKey,
    }).add(
      depleteKplStakingAccountInstruction,
      makeItOwnedByKPLProgramInstruction
    );

    console.log('Sending KPL staking account recovery transaction');

    await sendAndConfirmTransaction(
      sdk.k2Connection,
      recoverStakingAccountTransaction,
      [mainSystemAccount, kplStakingAccount]
    );
    console.log('Recovered KPL staking account');
  } catch (e) {
    console.error(e);
    throwTransactionError(e);
  }
};
