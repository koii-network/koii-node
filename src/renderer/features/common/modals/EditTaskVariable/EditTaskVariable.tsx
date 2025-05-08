import { Icon, CloseLine, SettingsLine } from '@_koii/koii-styleguide';
import { create, useModal } from '@ebay/nice-modal-react';
import React from 'react';

import { TaskVariableDataWithId } from 'models/api';
import { Button, ErrorMessage } from 'renderer/components/ui';
import { useTaskVariable } from 'renderer/features/common/hooks/useTaskVariable';
import { Modal, ModalContent } from 'renderer/features/modals';
import { Theme } from 'renderer/types/common';

const baseInputClassName =
  'px-6 py-2 text-sm rounded-md bg-finnieBlue-light-tertiary focus:ring-2 focus:ring-finnieTeal focus:outline-none focus:bg-finnieBlue-light-secondary';

interface Params {
  taskVariable: TaskVariableDataWithId;
}

export const EditTaskVariable = create<Params>(function EditTaskVariable({
  taskVariable,
}) {
  const modal = useModal();

  const {
    handleEditTaskVariable,
    handleLabelChange,
    handleToolKeyChange,
    label,
    labelError,
    value,
    errorEditingTaskVariable,
  } = useTaskVariable({
    onSuccess: modal.remove,
    taskVariable,
  });

  const SPHERON_STORAGE = 'Spheron_Storage';

  return (
    <Modal>
      <ModalContent
        theme={Theme.Dark}
        className="text-left p-5 pl-10 w-max h-fit rounded text-white flex flex-col gap-4 min-w-[740px]"
      >
        <div className="flex items-center justify-center w-full gap-4 pt-2 text-2xl font-semibold">
          <Icon source={SettingsLine} className="w-8 h-8" />
          <span>Edit a Task Extension</span>
          <Icon
            source={CloseLine}
            className="w-8 h-8 ml-auto cursor-pointer"
            onClick={modal.remove}
          />
        </div>

        <p className="mr-12">Edit information about your Task Extension</p>
        <div className="flex flex-col mb-2">
          <label className="mb-0.5 text-left" htmlFor="label-input">
            LABEL
          </label>
          <input
            className={`${baseInputClassName} w-56 ${
              taskVariable.label === SPHERON_STORAGE ? 'cursor-not-allowed' : ''
            }`}
            type="text"
            value={label}
            id="label-input"
            onChange={handleLabelChange}
            placeholder="Add Label"
            disabled={taskVariable.label === SPHERON_STORAGE}
          />
          <div className="h-12 -mt-2 -mb-10">
            {labelError && (
              <ErrorMessage error={labelError} className="text-xs" />
            )}
          </div>
        </div>

        <div className="flex flex-col mb-2">
          <label htmlFor="key-input" className="mb-0.5 text-left">
            KEY INPUT
          </label>
          <input
            id="key-input"
            className={`${baseInputClassName} w-full`}
            type="text"
            value={value}
            onChange={handleToolKeyChange}
            placeholder="Type key here"
          />
        </div>

        <div className="h-6 -mt-4 -mb-3 text-center">
          {errorEditingTaskVariable && (
            <ErrorMessage
              error={errorEditingTaskVariable}
              className="text-xs"
            />
          )}
        </div>

        <Button
          label="Save Settings"
          onClick={handleEditTaskVariable}
          disabled={!!labelError || !label || !value}
          className="w-56 h-12 m-auto font-semibold bg-finnieGray-tertiary text-finnieBlue-light"
        />
      </ModalContent>
    </Modal>
  );
});
