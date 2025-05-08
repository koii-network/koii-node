import {
  PublicKey,
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
import { CreditStakingWalletFromMainWalletPayloadType } from 'models';
import { throwTransactionError } from 'utils/error';

export const creditStakingWalletFromMainWallet = async (
  _: Event,
  { amountInRoe }: CreditStakingWalletFromMainWalletPayloadType
) => {
  try {
    const mainSystemAccountKeyPair = await getMainSystemAccountKeypair();
    const stakingAccountKeyPair = await getStakingAccountKeypair();

    console.log(`
    FUNDING STAKING WALLET
    From: ${mainSystemAccountKeyPair.publicKey.toBase58()}
    To: ${stakingAccountKeyPair.publicKey.toBase58()}
    Amount in Roe: ${amountInRoe}
    `);

    const accountInfo = await sdk.k2Connection.getAccountInfo(
      new PublicKey(stakingAccountKeyPair.publicKey)
    );

    console.log('ACCOUNT OWNER', accountInfo?.owner?.toBase58());

    if (accountInfo?.owner?.toBase58() === TASK_CONTRACT_ID.toBase58()) {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: mainSystemAccountKeyPair.publicKey,
          toPubkey: stakingAccountKeyPair.publicKey,
          lamports: amountInRoe,
        })
      );

      const transactionResponse = await sendAndConfirmTransaction(
        sdk.k2Connection,
        transaction,
        [mainSystemAccountKeyPair, stakingAccountKeyPair]
      );

      return transactionResponse;
    } else {
      const createStakingAccount = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: mainSystemAccountKeyPair.publicKey,
          newAccountPubkey: stakingAccountKeyPair.publicKey,
          lamports: amountInRoe,
          space: 100,
          programId: TASK_CONTRACT_ID,
        })
      );

      const transactionResponse = await sendAndConfirmTransaction(
        sdk.k2Connection,
        createStakingAccount,
        [mainSystemAccountKeyPair, stakingAccountKeyPair]
      );

      return transactionResponse;
    }
  } catch (e: unknown) {
    console.error('Error while funding staking wallet from main wallet', e);
    throwTransactionError(e);
  }
};
