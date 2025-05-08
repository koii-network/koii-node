import { RunningPrivateTasks, StoreUserConfigParam } from 'models';

/** neDB operations */

export const getUserConfig = async () => {
  const config = await window.main.getUserConfig();
  return config;
};

export const saveUserConfig = async (config: StoreUserConfigParam) => {
  const res = await window.main.storeUserConfig(config);
  return res;
};

export const getAllTimeRewards = async (taskPubKey: string) => {
  return window.main.getAllTimeRewardsByTask({ taskId: taskPubKey });
};

export const getRunnedPrivateTasks = (): Promise<RunningPrivateTasks> => {
  return window.main.getRunnedPrivateTasks();
};

export const setRunnedPrivateTasks = (privateTaskId: string): Promise<void> => {
  return window.main.setRunnedPrivateTasks({
    runnedPrivateTask: privateTaskId,
  });
};

export const cancelTaskRetry = async (taskPubKey: string) => {
  return window.main.cancelTaskRetry({ taskPubKey });
};
