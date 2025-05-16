import { Event } from 'electron';

import { ErrorType, PairedTaskVariables } from 'models';
import { throwDetailedError } from 'utils';

import { namespaceInstance } from '../../node/helpers/Namespace';
import { PersistentStoreKeys } from '../types';

import { getStoredPairedTaskVariables } from './getStoredPairedTaskVariables';

type UnpairTaskVariableByNameParamType = {
  taskAccountPubKey: string;
  variableName: string;
};

export const unpairTaskVariableByName = async (
  _: Event,
  payload: UnpairTaskVariableByNameParamType
): Promise<void> => {
  // payload validation
  if (!payload?.taskAccountPubKey || !payload?.variableName) {
    throw throwDetailedError({
      detailed: 'Unpair Task Variable by Name error: payload is not valid',
      type: ErrorType.GENERIC,
    });
  }

  const pairedTaskVariables = await getStoredPairedTaskVariables();

  const currentTaskPairing = pairedTaskVariables[payload.taskAccountPubKey];

  if (!currentTaskPairing) {
    console.log(
      `Unpair Task Variable by Name error: no pairings for Task with following ID ${payload.taskAccountPubKey}`
    );
    return;
  }

  // Create new task pairing object excluding entries with matching name
  const newTaskPairing = Object.fromEntries(
    Object.entries(currentTaskPairing).filter(
      ([name]) => name !== payload.variableName
    )
  );

  // If nothing was removed, just log and return
  if (
    Object.keys(newTaskPairing).length ===
    Object.keys(currentTaskPairing).length
  ) {
    console.log(
      `No variables found with name ${payload.variableName} for task ${payload.taskAccountPubKey}`
    );
    return;
  }

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
