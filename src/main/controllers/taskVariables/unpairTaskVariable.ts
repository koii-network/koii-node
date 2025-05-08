import { Event } from 'electron';

import {
  ErrorType,
  PairedTaskVariables,
  UnpairTaskVariableParamType,
} from 'models';
import { throwDetailedError } from 'utils';

import { namespaceInstance } from '../../node/helpers/Namespace';
import { PersistentStoreKeys } from '../types';

import { getStoredPairedTaskVariables } from './getStoredPairedTaskVariables';

export const unpairTaskVariable = async (
  _: Event,
  payload: UnpairTaskVariableParamType
): Promise<void> => {
  // payload validation
  if (!payload?.taskAccountPubKey || !payload?.desktopVariableId) {
    throw throwDetailedError({
      detailed: 'Unpair Task Variable error: payload is not valid',
      type: ErrorType.GENERIC,
    });
  }

  const pairedTaskVariables = await getStoredPairedTaskVariables();

  const currentTaskPairing = pairedTaskVariables[payload.taskAccountPubKey];

  if (!currentTaskPairing) {
    throw throwDetailedError({
      detailed: `Unpair Task Variable error: no pairings for Task with following ID ${payload.taskAccountPubKey}`,
      type: ErrorType.GENERIC,
    });
  }

  const inTaskVariableNameForUnpair = Object.entries(currentTaskPairing).find(
    ([, variableId]) => variableId === payload.desktopVariableId
  )?.[0];

  if (!inTaskVariableNameForUnpair) {
    throw throwDetailedError({
      detailed: `Unpair Task Variable error: no pairings for stored Task Variable with following ID ${payload.desktopVariableId}`,
      type: ErrorType.GENERIC,
    });
  }

  const newTaskPairing = { ...currentTaskPairing };
  delete newTaskPairing[inTaskVariableNameForUnpair];

  const newPairedTaskVariables: PairedTaskVariables = {
    ...pairedTaskVariables,
    [payload.taskAccountPubKey]: newTaskPairing,
  };

  const strigifiedPairsValue = JSON.stringify(newPairedTaskVariables);

  await namespaceInstance.storeSet(
    PersistentStoreKeys.TaskToVariablesPairs,
    strigifiedPairsValue
  );
};
