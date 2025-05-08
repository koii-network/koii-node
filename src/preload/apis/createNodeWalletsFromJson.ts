import config from 'config';
import {
  CreateNodeWalletsFromJsonParam,
  CreateNodeWalletsFromJsonResponse,
} from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (
  payload: CreateNodeWalletsFromJsonParam
): Promise<CreateNodeWalletsFromJsonResponse> =>
  sendMessage(config.endpoints.CREATE_NODE_WALLETS_FROM_JSON, payload);
