import config from 'config';
import {
  GetTasksPairedWithVariableParamType,
  GetTasksPairedWithVariableReturnType,
} from 'models';
import sendMessage from 'preload/sendMessage';

export const getTasksPairedWithVariable = (
  payload: GetTasksPairedWithVariableParamType
): Promise<GetTasksPairedWithVariableReturnType> =>
  sendMessage(config.endpoints.GET_TASKS_PAIRED_WITH_VARIABLE, payload);
