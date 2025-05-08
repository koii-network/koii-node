import config from 'config';
import sendMessage from 'preload/sendMessage';

export const setRunnedPrivateTasks = async (payload: {
  runnedPrivateTask: string;
}): Promise<void> =>
  sendMessage(config.endpoints.SET_RUNNED_PRIVATE_TASKS, payload);
