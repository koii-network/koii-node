import { getMyTaskStakeInfo } from '@koii-network/task-node';
import { isNumber } from 'lodash';
import {
  getKplStakingAccountKeypair,
  getStakingAccountKeypair,
} from 'main/node/helpers';
import sdk from 'main/services/sdk';
import {
  getTaskDataFromCache,
  saveStakeRecordToCache,
} from 'main/services/tasks-cache-utils';

export type GetMyTaskStakeParams = {
  taskAccountPubKey: string;
  revalidate?: boolean;
  shouldCache?: boolean;
  taskType: string;
};

export async function getMyTaskStake(
  _: Event,
  {
    taskAccountPubKey,
    revalidate,
    shouldCache = true,
    taskType,
  }: GetMyTaskStakeParams
): Promise<number> {
  try {
    const functionToGetStakingAccountKeypair =
      taskType === 'KPL'
        ? getKplStakingAccountKeypair
        : getStakingAccountKeypair;
    const stakingAccKeypair = await functionToGetStakingAccountKeypair();
    const stakingPubkey = stakingAccKeypair.publicKey.toBase58();

    const cachedStakeList = await getTaskDataFromCache(
      taskAccountPubKey,
      'stakeList'
    );
    const cachedStakeInfo = cachedStakeList?.stake_list?.[stakingPubkey];

    if (isNumber(cachedStakeInfo) && !revalidate) {
      return cachedStakeInfo;
    }
    let taskStakeInfo = 0;
    try {
      taskStakeInfo = await getMyTaskStakeInfo(
        sdk.k2Connection,
        taskAccountPubKey,
        stakingPubkey,
        taskType
      );
    } catch (error) {
      const thereIsNoStakeOnTask =
        error instanceof Error &&
        error.message.includes('No stake available on this task');
      if (thereIsNoStakeOnTask && shouldCache) {
        await saveStakeRecordToCache(taskAccountPubKey, stakingPubkey, 0);
      } else {
        throw error;
      }
    }
    if (shouldCache) {
      await saveStakeRecordToCache(
        taskAccountPubKey,
        stakingPubkey,
        taskStakeInfo
      );
    }

    return taskStakeInfo;
  } catch (error: any) {
    if (!error?.message?.toLowerCase().includes('no stake available')) {
      console.error('Error while fetching task stake info', error);
    }

    return 0;
  }
}
