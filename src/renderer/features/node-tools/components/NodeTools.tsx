import {
  Button,
  ButtonSize,
  ButtonVariant,
  CheckSuccessLine,
  Icon,
} from '@_koii/koii-styleguide';
import React, { RefObject, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';

import { isEqual } from 'lodash';
import { RequirementTag } from 'models/task';
import {
  ErrorMessage,
  LoadingSpinner,
  LoadingSpinnerSize,
} from 'renderer/components/ui';
import { QueryKeys, pairTaskVariable } from 'renderer/services';

import { getPairedTaskVariablesForTask } from '../helpers';
import { useAllStoredPairedTaskVariables } from '../hooks';

import { NodeTool } from './NodeTool';

type PropsType = {
  taskPubKey: string;
  onToolsValidation?: (isValid: boolean) => void;
  tools?: RequirementTag[];
  onPairingSuccess: () => void;
  onOpenAddTaskVariableModal: (
    dropdownRef: RefObject<HTMLButtonElement>,
    tool: string
  ) => void;
};

export function NodeTools({
  taskPubKey,
  onToolsValidation,
  tools,
  onPairingSuccess,
  onOpenAddTaskVariableModal,
}: PropsType) {
  const queryCache = useQueryClient();
  const {
    storedPairedTaskVariablesQuery: {
      data: pairedVariables,
      isLoading: isLoadingPairedVariables,
      error: pairedVariablesError,
    },
  } = useAllStoredPairedTaskVariables({
    enabled: !!taskPubKey,
  });

  const [selectedTools, setSelectedTools] = useState<Record<string, string>>(
    {}
  );

  const pairedVariablesForTask = useMemo(
    () => getPairedTaskVariablesForTask(taskPubKey, pairedVariables),
    [pairedVariables, taskPubKey]
  );

  const areAllVariablesSelected = useMemo(
    () => !!tools?.every(({ value }) => !!selectedTools[value as string]),
    [tools, selectedTools]
  );

  const selectedVariablesAreSameAsCurrentlyPaired = isEqual(
    pairedVariablesForTask,
    selectedTools
  );

  const handleToolPick = (tool: string, desktopVariableId: string) => {
    setSelectedTools({ ...selectedTools, [tool]: desktopVariableId });
  };

  const confirmTaskVariables = async () => {
    const tools = Object.entries(selectedTools);

    for (const [tool, desktopVariableId] of tools) {
      await pairTaskVariable({
        taskAccountPubKey: taskPubKey,
        variableInTaskName: tool,
        desktopVariableId,
      });
    }
  };

  const onSuccess = () => {
    onPairingSuccess();

    // As at this specific stage we have just successfully paired, if all variables are selected means they are paired too
    onToolsValidation?.(areAllVariablesSelected);
    queryCache.invalidateQueries([QueryKeys.StoredTaskVariables]);
    queryCache.invalidateQueries([QueryKeys.StoredPairedTaskVariables]);

    toast.success('Task extensions successfully paired');
  };

  const onError = () => {
    toast.error('Task extensions pairing failed. Try Again');
  };

  const { mutate: pairTaskVariables, isLoading: isPairingTasksVariables } =
    useMutation(confirmTaskVariables, {
      onSuccess,
      onError,
    });

  const isLoading = isLoadingPairedVariables;

  const handleInit = (tool: string, desktopVariableId: string) => {
    /**
     * @dev
     * We need to set the default value for the tool which are not yet selected,
     * so we can validate the form and show the "Confirm" button
     */
    setSelectedTools((selected) => ({
      ...selected,
      [tool]: desktopVariableId,
    }));
  };

  const canPairVariables = useMemo(
    () =>
      areAllVariablesSelected &&
      !selectedVariablesAreSameAsCurrentlyPaired &&
      !isPairingTasksVariables,
    [
      areAllVariablesSelected,
      selectedVariablesAreSameAsCurrentlyPaired,
      isPairingTasksVariables,
    ]
  );

  if (pairedVariablesError) {
    return <ErrorMessage error={pairedVariablesError as string} />;
  }

  return (
    <div className="w-full pr-4 2xl:pr-[12%]">
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-40 gap-4">
          <LoadingSpinner size={LoadingSpinnerSize.Large} />
          <div>Loading Node Tools</div>
        </div>
      )}
      {!isLoading && (
        <>
          {tools?.map(({ value, description, retrievalInfo }, index) => (
            <NodeTool
              onSecretSelected={handleToolPick}
              selectedSecrets={selectedTools}
              onInit={handleInit}
              tool={value as string}
              retrievalInfo={retrievalInfo}
              key={index}
              defaultVariableId={pairedVariablesForTask[value as string]}
              description={description}
              onOpenAddTaskVariableModal={onOpenAddTaskVariableModal}
            />
          ))}
          {canPairVariables && (
            <div className="flex justify-end">
              <Button
                variant={ButtonVariant.Primary}
                size={ButtonSize.SM}
                label={isPairingTasksVariables ? 'Pairing...' : 'Confirm All'}
                iconLeft={
                  isPairingTasksVariables ? (
                    <LoadingSpinner />
                  ) : (
                    <Icon source={CheckSuccessLine} />
                  )
                }
                onClick={() => pairTaskVariables()}
                disabled={!canPairVariables}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
