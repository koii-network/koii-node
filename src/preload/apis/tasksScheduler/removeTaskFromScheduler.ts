import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (payload: { taskPublicKey: string }): Promise<void> =>
  sendMessage(config.endpoints.REMOVE_TASK_FROM_SCHEDULER, payload);
