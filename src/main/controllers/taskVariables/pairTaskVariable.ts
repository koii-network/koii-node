import { Event } from 'electron';

import {
  ErrorType,
  PairedTaskVariables,
  PairTaskVariableParamType,
} from 'models';
import { throwDetailedError } from 'utils';

import { namespaceInstance } from '../../node/helpers/Namespace';
import { PersistentStoreKeys } from '../types';

import { getStoredPairedTaskVariables } from './getStoredPairedTaskVariables';
import { getStoredTaskVariables } from './getStoredTaskVariables';

export const pairTaskVariable = async (
  _: Event,
  payload: PairTaskVariableParamType
  // eslint-disable-next-line consistent-return
): Promise<void> => {
  // payload validation
  if (
    !payload?.taskAccountPubKey ||
    !payload?.variableInTaskName ||
    !payload?.desktopVariableId
  ) {
    throw throwDetailedError({
      detailed: 'Variable Pairing error: payload is not valid',
      type: ErrorType.GENERIC,
    });
  }

  // desktopVariableId validation

  const taskVariables = await getStoredTaskVariables();

  if (!taskVariables[payload.desktopVariableId]) {
    return throwDetailedError({
      detailed:
        'Variable Pairing error: Desktop Variable ID in the Task not found',
      type: ErrorType.GENERIC,
    });
  }

  // pairing

  const pairedTaskVariables = await getStoredPairedTaskVariables();

  const newPairedTaskVariables: PairedTaskVariables = {
    ...pairedTaskVariables,
    [payload.taskAccountPubKey]: {
      ...pairedTaskVariables[payload.taskAccountPubKey],
      [payload.variableInTaskName]: payload.desktopVariableId,
    },
  };

  const strigifiedPairsValue = JSON.stringify(newPairedTaskVariables);

  await namespaceInstance.storeSet(
    PersistentStoreKeys.TaskToVariablesPairs,
    strigifiedPairsValue
  );
};
