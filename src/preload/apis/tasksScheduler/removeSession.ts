import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (payload: { id: string }): Promise<void> =>
  sendMessage(config.endpoints.REMOVE_TASKS_SCHEDULE, payload);
