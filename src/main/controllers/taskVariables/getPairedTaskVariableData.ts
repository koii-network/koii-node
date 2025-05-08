import {
  GetPairedTaskVariableDataParamType,
  GetPairedTaskVariableDataReturnType,
} from 'models';

import { getStoredPairedTaskVariables } from './getStoredPairedTaskVariables';
import { getStoredTaskVariables } from './getStoredTaskVariables';

export const getPairedTaskVariableData = async ({
  taskAccountPubKey,
}: GetPairedTaskVariableDataParamType): Promise<GetPairedTaskVariableDataReturnType> => {
  const pairedTaskVariables = await getStoredPairedTaskVariables();
  const taskPairings = pairedTaskVariables[taskAccountPubKey];
  const taskVariables = await getStoredTaskVariables();

  return { taskPairings, taskVariables };
};
