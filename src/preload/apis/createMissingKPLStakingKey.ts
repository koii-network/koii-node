import config from 'config';
import { CreateNodeWalletsParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: CreateNodeWalletsParam) =>
  sendMessage(config.endpoints.CREATE_MISSING_KPL_STAKING_KEY, payload);
