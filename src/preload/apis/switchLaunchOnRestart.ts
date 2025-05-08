import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (): Promise<void> =>
  sendMessage(config.endpoints.SWITCH_LAUNCH_ON_RESTART, {});
