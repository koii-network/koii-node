import { PublicKey } from '@_koii/web3.js';
import { ArchiveTaskParams } from 'models';

import koiiTasks from '../services/koiiTasks';

import claimReward from './claimReward';
import { claimRewardKPL } from './claimRewardKPL';

export const archiveTask = async (_: Event, payload: ArchiveTaskParams) => {
  if (!payload.skipClaimRewards) {
    try {
      const taskState = (await koiiTasks.getStartedTasks())?.find(
        (task) => task.task_id === payload.taskPubKey
      );
      const handlerToClaimRewards =
        taskState?.task_type === 'KPL' ? claimRewardKPL : claimReward;

      await handlerToClaimRewards({} as Event, {
        taskAccountPubKey: payload.taskPubKey,
        tokenType: taskState?.token_type
          ? new PublicKey(taskState?.token_type as any).toBase58()
          : '',
      });
    } catch (error: any) {
      const taskDidntHaveRewardsToClaim = error?.message?.includes(
        "The provided claimer account doesn't have any balance on task state"
      );
      if (!taskDidntHaveRewardsToClaim) {
        throw error;
      }
    }
  }

  koiiTasks.removeTaskFromStartedTasks(payload.taskPubKey);
};
