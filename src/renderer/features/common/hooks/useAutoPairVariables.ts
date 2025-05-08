import { useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from 'react-query';

import { RequirementTag } from 'models';
import {
  useAllStoredPairedTaskVariables,
  useStoredTaskVariables,
} from 'renderer/features/node-tools';
import { getPairedTaskVariablesForTask } from 'renderer/features/node-tools/helpers';
import { QueryKeys, pairTaskVariable } from 'renderer/services';

interface UseAutoPairVariablesProps {
  taskPublicKey: string;
  taskVariables: RequirementTag[];
}

export const useAutoPairVariables = ({
  taskPublicKey,
  taskVariables,
}: UseAutoPairVariablesProps) => {
  const {
    storedTaskVariablesQuery: { data: storedTaskVariables },
  } = useStoredTaskVariables();

  const {
    storedPairedTaskVariablesQuery: { data: pairedVariables },
  } = useAllStoredPairedTaskVariables({
    enabled: !!taskPublicKey,
  });

  const pairedVariablesForTask = useMemo(
    () => getPairedTaskVariablesForTask(taskPublicKey, pairedVariables),
    [pairedVariables, taskPublicKey]
  );

  const confirmTaskVariables = useCallback(
    async (recordOfPairings: Record<string, string>) => {
      const promises = Object.entries(recordOfPairings)
        .filter(([, desktopVariableId]) => !!desktopVariableId)
        .map(([tool, desktopVariableId]) => {
          return pairTaskVariable({
            taskAccountPubKey: taskPublicKey,
            variableInTaskName: tool,
            desktopVariableId,
          });
        });

      await Promise.all(promises);
    },
    [taskPublicKey]
  );

  const queryClient = useQueryClient();

  const autoPairTaskVariables = useCallback(async () => {
    const pairings = taskVariables
      ?.map(({ value: toolLabel }) => {
        const toolIdPairs = Object.entries(storedTaskVariables || {}).reduce<
          Record<string, string>
        >((acc, [id, taskVariable]) => {
          const variableShouldAutoPair =
            taskVariable.label === toolLabel &&
            !(toolLabel in pairedVariablesForTask);

          if (variableShouldAutoPair) {
            acc[toolLabel] = id;
          }
          return acc;
        }, {});

        return toolIdPairs;
      })
      .filter((toolIdPair) => Object.keys(toolIdPair).length > 0);

    const recordOfPairings = pairings?.reduce((acc, pairing) => {
      return { ...acc, ...pairing };
    }, {});

    if (pairings?.length) {
      try {
        await confirmTaskVariables(recordOfPairings);

        await queryClient.invalidateQueries([QueryKeys.StoredTaskVariables]);
        await queryClient.invalidateQueries([
          QueryKeys.StoredPairedTaskVariables,
        ]);
        await queryClient.invalidateQueries([
          QueryKeys.StoredTaskPairedTaskVariables,
        ]);
      } catch (_) {
        _;
      }
    }
  }, [
    confirmTaskVariables,
    taskVariables,
    storedTaskVariables,
    pairedVariablesForTask,
    queryClient,
  ]);

  useEffect(() => {
    autoPairTaskVariables();
  }, [autoPairTaskVariables]);
};

export default useAutoPairVariables;
