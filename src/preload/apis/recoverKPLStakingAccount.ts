import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (): Promise<void> =>
  sendMessage(config.endpoints.RECOVER_KPL_STAKING_ACCOUNT, {});
