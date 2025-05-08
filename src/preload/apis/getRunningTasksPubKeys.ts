import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (): Promise<string[]> =>
  sendMessage(config.endpoints.GET_RUNNING_TASKS_PUBKEYS, {});
