import { ChangeEventHandler, useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { TaskVariableData, TaskVariableDataWithId } from 'models/api';
import {
  QueryKeys,
  editTaskVariable as editTaskVariableService,
  getStoredTaskVariables,
  storeTaskVariable as storeTaskVariableService,
} from 'renderer/services';

interface Params {
  onSuccess?: () => void;
  taskVariable?: TaskVariableDataWithId;
}

export const useTaskVariable = ({ onSuccess, taskVariable }: Params = {}) => {
  const [label, setLabel] = useState<string>(taskVariable?.label || '');
  const [value, setValue] = useState<string>(taskVariable?.value || '');
  const [labelError, setLabelError] = useState<string>('');

  const queryClient = useQueryClient();

  const { data: storedTaskVariables = {} } = useQuery(
    QueryKeys.TaskVariables,
    getStoredTaskVariables
  );

  const resetFields = () => {
    setLabel('');
    setValue('');
    setLabelError('');
  };

  const handleSuccess = () => {
    resetFields();
    queryClient.invalidateQueries([QueryKeys.TaskVariables]);
    onSuccess?.();
  };

  const {
    mutate: storeTaskVariable,
    error: errorStoringTaskVariable,
    isLoading: storingTaskVariable,
  } = useMutation<void, Error, TaskVariableData>(storeTaskVariableService, {
    onSuccess: handleSuccess,
  });

  const { mutate: editTaskVariable, error: errorEditingTaskVariable } =
    useMutation<void, Error, TaskVariableDataWithId>(editTaskVariableService, {
      onSuccess: handleSuccess,
    });

  const handleAddTaskVariable = (overrideValue?: string) =>
    storeTaskVariable({ label, value: overrideValue || value });

  const handleEditTaskVariable = () =>
    editTaskVariable({ id: taskVariable?.id || '', label, value });

  const isEditingExistingVariable = !!taskVariable?.id;

  const validateLabelDuplication = useCallback(
    (label: string) => {
      const storedTaskVariablesLabels = Object.values(storedTaskVariables).map(
        ({ label }) => label
      );
      const enteredLabelIsDuplicate = storedTaskVariablesLabels?.some(
        (storedLabel) =>
          isEditingExistingVariable
            ? storedLabel === label && storedLabel !== taskVariable?.label
            : storedLabel === label
      );
      if (enteredLabelIsDuplicate) {
        setLabelError(
          'You already have an extension registered with that label'
        );
      }
    },
    [storedTaskVariables, taskVariable?.label, isEditingExistingVariable]
  );

  const handleLabelChange: ChangeEventHandler<HTMLInputElement> = ({
    target: { value: label },
  }) => {
    setLabelError('');
    setLabel(label);
    validateLabelDuplication(label);
  };

  useEffect(() => {
    const isCreatingNewVariableWithPresetLabel =
      taskVariable?.label && !isEditingExistingVariable;
    if (isCreatingNewVariableWithPresetLabel) {
      validateLabelDuplication(taskVariable?.label);
    }
  }, [
    validateLabelDuplication,
    taskVariable?.label,
    isEditingExistingVariable,
  ]);

  const handleToolKeyChange: ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => setValue(value);

  return {
    handleAddTaskVariable,
    handleEditTaskVariable,
    handleLabelChange,
    handleToolKeyChange,
    label,
    value,
    storingTaskVariable,
    storedTaskVariables,
    errorStoringTaskVariable,
    errorEditingTaskVariable,
    labelError,
  };
};
