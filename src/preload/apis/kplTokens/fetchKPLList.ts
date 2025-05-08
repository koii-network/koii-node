import config from 'config';
import { fetchKPLListResponse } from 'models';
import sendMessage from 'preload/sendMessage';

export const fetchKPLList = async (): Promise<fetchKPLListResponse> =>
  sendMessage(config.endpoints.FETCH_KPL_LIST, {});
