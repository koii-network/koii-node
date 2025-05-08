import config from 'config';
import { GetStoredPairedTaskVariablesReturnType } from 'models';
import sendMessage from 'preload/sendMessage';

export const getStoredPairedTaskVariables =
  (): Promise<GetStoredPairedTaskVariablesReturnType> =>
    sendMessage(config.endpoints.GET_STORED_PAIRED_TASK_VARIABLES, null);
