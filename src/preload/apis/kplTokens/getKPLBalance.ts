import config from 'config';
import { KPLBalanceResponse } from 'models';
import sendMessage from 'preload/sendMessage';

export const getKPLBalance = async (
  payload: string
): Promise<KPLBalanceResponse[]> =>
  sendMessage(config.endpoints.GET_KPL_BALANCE, payload);
