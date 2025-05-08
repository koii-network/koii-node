import { KPL_CONTRACT_ID, TASK_CONTRACT_ID } from '@koii-network/task-node';
import { PublicKey } from '@solana/web3.js';
import sdk from 'main/services/sdk';

import getAccountBalance from './getAccountBalance';

export const checkIfStakingAccountIsFaulty = async (
  _: Event,
  {
    stakingPublicKey,
    isKPLStakingAccount,
  }: { stakingPublicKey: string; isKPLStakingAccount: boolean }
): Promise<boolean> => {
  const accountInfo = await sdk.k2Connection.getAccountInfo(
    new PublicKey(stakingPublicKey)
  );
  const correspondingProgramId = isKPLStakingAccount
    ? KPL_CONTRACT_ID
    : TASK_CONTRACT_ID;
  const isOwnedByCorrespondingProgram =
    accountInfo?.owner?.toBase58() === correspondingProgramId.toBase58();
  if (isOwnedByCorrespondingProgram) return false;
  const stakingAccountBalance = await getAccountBalance(
    {} as Event,
    stakingPublicKey
  );
  const stakingAccountHasBalance = stakingAccountBalance > 0;

  const stakingAccountIsFaulty =
    !isOwnedByCorrespondingProgram && stakingAccountHasBalance;

  return stakingAccountIsFaulty;
};
