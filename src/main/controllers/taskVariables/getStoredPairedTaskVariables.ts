import { namespaceInstance } from 'main/node/helpers/Namespace';
import {
  PairedTaskVariables,
  GetStoredPairedTaskVariablesReturnType,
} from 'models';

import { PersistentStoreKeys } from '../types';

import { getStoredTaskVariables } from './getStoredTaskVariables';

export const getStoredPairedTaskVariables =
  async (): Promise<GetStoredPairedTaskVariablesReturnType> => {
    const pairedTaskVariablesStringified: string =
      await namespaceInstance.storeGet(
        PersistentStoreKeys.TaskToVariablesPairs
      );

    try {
      const pairedTaskVariables: PairedTaskVariables = {
        ...(JSON.parse(pairedTaskVariablesStringified) as PairedTaskVariables),
      };

      const activeStoredTaskVariables = await getStoredTaskVariables();
      const activePairingIds = Object.keys(activeStoredTaskVariables || {});
      const pairingsWithActiveIds = Object.entries(
        pairedTaskVariables
      ).reduce<GetStoredPairedTaskVariablesReturnType>(
        (acc, [taskId, recordOfPairings]) => {
          const validPairingsForTask = Object.entries(recordOfPairings)
            .filter(([_, variableId]) => activePairingIds.includes(variableId))
            .reduce<GetStoredPairedTaskVariablesReturnType[string]>(
              (innerAcc, [innerKey, innerValue]) => {
                innerAcc[innerKey] = innerValue;
                return innerAcc;
              },
              {}
            );

          if (Object.keys(validPairingsForTask).length > 0) {
            acc[taskId] = validPairingsForTask;
          }

          return acc;
        },
        {}
      );

      return pairingsWithActiveIds;
    } catch (error) {
      console.log('Get Stored Paired Task Variables: JSON parse error', error);
      return {};
    }
  };
