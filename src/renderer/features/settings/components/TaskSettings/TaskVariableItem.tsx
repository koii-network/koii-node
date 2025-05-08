import {
  Icon,
  ViewShowLine,
  EditPencilLine,
  DeleteTrashXlLine,
} from '@_koii/koii-styleguide';
import React from 'react';

import { TaskVariableDataWithId } from 'models/api';
import {
  useDeleteTaskVariable,
  useEditTaskVariable,
  useInspectTaskVariable,
} from 'renderer/features/common/hooks';

interface Props {
  taskVariable: TaskVariableDataWithId;
}

export function TaskVariableItem({ taskVariable }: Props) {
  const { label } = taskVariable;
  const { showModal: showDeleteModal } = useDeleteTaskVariable(taskVariable);
  const { showModal: showEditModal } = useEditTaskVariable(taskVariable);
  const { showModal: showInspectModal } = useInspectTaskVariable(taskVariable);
  const SPHERON_STORAGE = 'Spheron_Storage';

  const isNotDeletable = label === SPHERON_STORAGE;

  return (
    <div className="flex items-center">
      <div className="px-6 py-2 mr-6 text-sm rounded-md bg-finnieBlue-light-tertiary w-80">
        {label}
      </div>

      <Icon
        source={ViewShowLine}
        className="h-3.5 mx-2 cursor-pointer"
        onClick={showInspectModal}
        data-testid="inspect-task-variable"
      />
      <Icon
        source={EditPencilLine}
        className="h-4 mx-2 cursor-pointer"
        onClick={showEditModal}
        data-testid="edit-task-variable"
      />

      {!isNotDeletable && (
        <Icon
          source={DeleteTrashXlLine}
          className="h-5 mx-2 cursor-pointer text-finnieRed"
          onClick={showDeleteModal}
          data-testid="delete-task-variable"
        />
      )}
    </div>
  );
}
