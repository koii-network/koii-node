import { getMyTaskSubmissionRoundInfo as getMyTaskSubmissionRoundInfoK2 } from '@koii-network/task-node';
import { getStakingAccountKeypair } from 'main/node/helpers';
import sdk from 'main/services/sdk';

export type GetMyTaskSubmissionInfoParams = {
  taskAccountPubKey: string;
  round: number;
};

export type SubmissionInfoType = Awaited<
  ReturnType<typeof getMyTaskSubmissionRoundInfoK2>
>;

export async function getMyTaskSubmissionRoundInfo(
  _: Event,
  { taskAccountPubKey, round }: GetMyTaskSubmissionInfoParams
): Promise<SubmissionInfoType | null> {
  try {
    const stakingAccKeypair = await getStakingAccountKeypair();
    const stakingPubkey = stakingAccKeypair.publicKey.toBase58();
    const taskStakeInfo = await getMyTaskSubmissionRoundInfoK2(
      sdk.k2Connection,
      taskAccountPubKey,
      stakingPubkey,
      round,
      'KOII'
    );

    return taskStakeInfo;
  } catch (error) {
    console.log('Error in getMyTaskSubmissionRoundInfo', error);
    return null;
  }
}
