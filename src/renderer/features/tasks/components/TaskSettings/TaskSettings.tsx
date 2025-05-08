import { TooltipChatQuestionLeftLine, Icon } from '@_koii/koii-styleguide';
import { show } from '@ebay/nice-modal-react';
import React, { RefObject } from 'react';
import { twMerge } from 'tailwind-merge';

import { RequirementTag, TaskMetadata } from 'models/task';
import { Tooltip } from 'renderer/components/ui';
import { NodeTools } from 'renderer/features/node-tools';

import { TaskMetadataModal } from './MetadataModal';

type PropsType = {
  taskPubKey: string;
  onOpenAddTaskVariableModal: (
    dropdownRef: RefObject<HTMLButtonElement>,
    tool: string
  ) => void;
  taskVariables?: RequirementTag[];
  onToolsValidation?: (isValid: boolean) => void;
  onPairingSuccess: () => void;
  moveToTaskInfo?: () => void;
  wrapperClasses?: string;
  metadata?: TaskMetadata | null;
};

export function TaskSettings({
  taskVariables,
  taskPubKey,
  onToolsValidation,
  onPairingSuccess,
  onOpenAddTaskVariableModal,
  moveToTaskInfo,
  wrapperClasses = '',
  metadata,
}: PropsType) {
  const outerClasses = twMerge(
    'flex flex-col w-full h-fit ml-3',
    wrapperClasses
  );

  const showMetadataModal = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    show(TaskMetadataModal, { metadata });
  };

  return (
    <div className={outerClasses}>
      <div className="flex items-center gap-2 mb-1 text-xs font-bold">
        TASK EXTENSION CONFIGURATION
        <Tooltip
          placement="right"
          tooltipContent="Task extensions are additional integrations from other tools necessary to run the task"
        >
          <Icon size={20} source={TooltipChatQuestionLeftLine} />
        </Tooltip>
      </div>

      <div className="mb-4 font-normal">
        Check the{' '}
        <button
          className="underline text-finnieTeal"
          onClick={moveToTaskInfo || showMetadataModal}
        >
          task creator&apos;s instructions
        </button>{' '}
        for configuring settings.
      </div>

      <NodeTools
        tools={taskVariables}
        taskPubKey={taskPubKey}
        onToolsValidation={onToolsValidation}
        onPairingSuccess={onPairingSuccess}
        onOpenAddTaskVariableModal={onOpenAddTaskVariableModal}
      />
    </div>
  );
}
