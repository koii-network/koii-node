import config from 'config';
import {
  GetTaskPairedVariablesNamesWithLabelsParamType,
  GetTaskPairedVariablesNamesWithLabelsReturnType,
} from 'models';
import sendMessage from 'preload/sendMessage';

export const getTaskPairedVariablesNamesWithLabels = (
  payload: GetTaskPairedVariablesNamesWithLabelsParamType
): Promise<GetTaskPairedVariablesNamesWithLabelsReturnType> =>
  sendMessage(
    config.endpoints.GET_TASK_PAIRED_VARIABLES_NAMES_WITH_LABELS,
    payload
  );
