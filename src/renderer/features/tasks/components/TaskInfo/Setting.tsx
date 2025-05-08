import { AddLine, Icon } from '@_koii/koii-styleguide';
import React, { RefObject, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';

import { Dropdown, DropdownItem } from 'renderer/components/ui';
import { useStoredTaskVariables } from 'renderer/features/node-tools';
import {
  QueryKeys,
  pairTaskVariable,
  startTask,
  stopTask,
} from 'renderer/services';

interface Props {
  publicKey: string;
  name: string;
  label: string;
  isRunning?: boolean;
  onOpenAddTaskVariableModal?: (
    dropdownRef: RefObject<HTMLButtonElement>,
    settingName: string
  ) => void;
  isEditDisabled?: boolean;
}

export function Setting({
  publicKey,
  name,
  label,
  isRunning,
  onOpenAddTaskVariableModal,
  isEditDisabled,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [newSettingId, setNewSettingId] = useState<DropdownItem['id']>('');

  const dropdownRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!label) {
      setIsEditing(true);
    }
  }, [label]);

  const toggleEditMode = () => setIsEditing(!isEditing);
  const handleClickCancel = () => {
    setNewSettingId('');
    toggleEditMode();
  };
  const handleSelect = (item: DropdownItem) => {
    setNewSettingId(item.id);
  };

  const {
    storedTaskVariablesQuery: { data: taskSettings, isLoading },
  } = useStoredTaskVariables();

  const queryClient = useQueryClient();

  const { mutate: pairTaskSetting, isLoading: isPairing } = useMutation(
    () =>
      pairTaskVariable({
        taskAccountPubKey: publicKey,
        variableInTaskName: name,
        desktopVariableId: newSettingId,
      }),
    {
      onSuccess: async () => {
        queryClient.invalidateQueries([
          QueryKeys.StoredTaskPairedTaskVariables,
          publicKey,
        ]);
        toast.success('Task extension successfully paired.');
        handleClickCancel();
        if (isRunning) {
          try {
            await stopTask(publicKey);
            await startTask(publicKey);
          } catch (error) {
            console.warn(error);
            toast.error(
              'Restarting the task failed after pairing. Try stopping and running it manually to use the new extension.',
              {
                duration: 10000,
              }
            );
          } finally {
            queryClient.invalidateQueries([QueryKeys.TaskList]);
          }
        }
      },
      onError: () => {
        toast.error('Task extension pairing failed. Try Again.');
      },
    }
  );

  const dropdownItems = !taskSettings
    ? []
    : Object.entries(taskSettings).map(([id, taskVariableItem]) => ({
        id,
        ...taskVariableItem,
      }));

  const isRightButtonDisabled = (isEditing && !newSettingId) || isPairing;
  const rightButtonClasses = `p-2 mr-2 text-sm rounded-md bg-finnieBlue-light-tertiary w-12 ${
    isRightButtonDisabled && 'opacity-50'
  }`;
  const handleRightButtonClick = isEditing
    ? () => pairTaskSetting()
    : toggleEditMode;

  if (isLoading) return null;

  return (
    <div className="flex-col items-center my-3">
      <div className="mb-2 text-xs font-semibold">{name}</div>
      <div className="flex">
        {isEditing ? (
          <>
            <button
              onClick={handleClickCancel}
              className="p-2 mr-4 text-sm rounded-md bg-finnieBlue-light-tertiary"
            >
              Cancel
            </button>
            <Dropdown
              ref={dropdownRef}
              className="-mb-4 !w-80 mr-4"
              items={dropdownItems}
              onSelect={handleSelect}
              customItem={
                <div className="hover:bg-purple-1 hovertext-finnieTeal-100">
                  <button
                    className="flex items-center justify-start gap-2 py-2 pl-3 cursor-pointer text-green-2 curs w-fit"
                    onClick={() =>
                      onOpenAddTaskVariableModal?.(dropdownRef, name)
                    }
                  >
                    <Icon source={AddLine} size={18} />
                    <span>Add New</span>
                  </button>
                </div>
              }
            />
          </>
        ) : (
          <div className="px-6 py-2 mr-4 text-sm rounded-md bg-finnieBlue-light-tertiary w-80">
            {label}
          </div>
        )}
        {!isEditDisabled && (
          <button
            onClick={handleRightButtonClick}
            className={rightButtonClasses}
            disabled={isRightButtonDisabled}
          >
            {isEditing ? 'Pair' : 'Edit'}
          </button>
        )}
      </div>
    </div>
  );
}
