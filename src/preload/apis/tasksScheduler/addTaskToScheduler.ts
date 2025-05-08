import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (payload: { taskPublicKey: string }): Promise<void> =>
  sendMessage(config.endpoints.ADD_TASK_TO_SCHEDULER, payload);
