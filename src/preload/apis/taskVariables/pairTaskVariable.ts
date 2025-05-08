import config from 'config';
import { PairTaskVariableParamType } from 'models';
import sendMessage from 'preload/sendMessage';

export const pairTaskVariable = (
  payload: PairTaskVariableParamType
): Promise<void> => sendMessage(config.endpoints.PAIR_TASK_VARIABLE, payload);
