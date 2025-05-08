import { PublicKey } from '@_koii/web3.js';
import { getTaskDataFromCache } from 'main/services/tasks-cache-utils';
import { ErrorType } from 'models';
import { GetTaskNodeInfoResponse } from 'models/api';
import { throwDetailedError } from 'utils';

import KoiiTasks from '../services/koiiTasks';

import { getKPLStakingAccountPubKey } from './getKPLStakingAccountPubKey';
import getStakingAccountPubKey from './getStakingAccountPubKey';

const getTaskNodeInfo = async (_: Event): Promise<GetTaskNodeInfoResponse> => {
  try {
    const totalStaked: GetTaskNodeInfoResponse['totalStaked'] = {};
    const pendingRewards: GetTaskNodeInfoResponse['pendingRewards'] = {};
    const tasks = await KoiiTasks.getStartedTasks();

    await Promise.all(
      tasks.map(async (task) => {
        const stake = await getTaskDataFromCache(task.task_id, 'stakeList');
        const getCorrespondingStakingKey =
          task.task_type === 'KPL'
            ? getKPLStakingAccountPubKey
            : getStakingAccountPubKey;
        const stakingPubKeyToUse = await getCorrespondingStakingKey();
        const stakeValue = stake?.stake_list?.[stakingPubKeyToUse];
        const tokenKey = task.token_type
          ? new PublicKey(task.token_type)?.toBase58()
          : 'KOII';

        if (!totalStaked[tokenKey]) totalStaked[tokenKey] = 0;
        if (!pendingRewards[tokenKey]) pendingRewards[tokenKey] = 0;
        totalStaked[tokenKey] += stakeValue || 0;
        pendingRewards[tokenKey] +=
          task.available_balances?.[stakingPubKeyToUse] || 0;
      })
    );

    return {
      totalStaked,
      pendingRewards,
    };
  } catch (e: any) {
    if (e?.message !== 'Tasks not fetched yet') console.error(e);
    return throwDetailedError({
      detailed: e,
      type: ErrorType.GENERIC,
    });
  }
};

export default getTaskNodeInfo;
