import config from 'config';
import sendMessage from 'preload/sendMessage';

export const limitLogsSize = (): Promise<boolean> =>
  sendMessage(config.endpoints.LIMIT_LOGS_SIZE, {});
