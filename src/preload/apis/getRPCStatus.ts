import config from 'config';
import { RPCStatusResponse } from 'models/api/RPCStatus';
import sendMessage from 'preload/sendMessage';

export default (): Promise<RPCStatusResponse[] | null> =>
  sendMessage(config.endpoints.GET_RPC_STATUS, {});
