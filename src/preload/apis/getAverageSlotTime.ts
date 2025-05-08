import config from 'config';

import sendMessage from '../sendMessage';

export default (): Promise<number> =>
  sendMessage(config.endpoints.GET_AVERAGE_SLOT_TIME, {});
