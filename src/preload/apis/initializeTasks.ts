import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (): Promise<void> =>
  sendMessage(config.endpoints.INITIALIZE_TASKS, {});
