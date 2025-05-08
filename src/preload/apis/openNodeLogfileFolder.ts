import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (): Promise<boolean> =>
  sendMessage(config.endpoints.OPEN_NODE_LOGFILE_FOLDER, {});
