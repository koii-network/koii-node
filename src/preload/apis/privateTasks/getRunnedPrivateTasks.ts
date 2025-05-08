import config from 'config';
import { RunningPrivateTasks } from 'models/api/privateTasks/types';
import sendMessage from 'preload/sendMessage';

export const getRunnedPrivateTasks = async (): Promise<RunningPrivateTasks> => {
  return sendMessage(config.endpoints.GET_RUNNED_PRIVATE_TASKS, {});
};
