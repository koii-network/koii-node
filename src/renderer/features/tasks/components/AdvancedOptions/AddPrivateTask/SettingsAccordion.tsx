import React, { RefObject, forwardRef } from 'react';

import { RequirementTag, TaskMetadata } from 'models';

import { TaskSettings } from '../../TaskSettings';

type PropsType = {
  isOpen: boolean;
  taskPubkey: string;
  globalAndTaskVariables: RequirementTag[];
  onTaskToolsValidationCheck: (isValid: boolean) => void;
  onCloseAccordionView: () => void;
  onOpenAddTaskVariableModal: (
    dropdownRef: RefObject<HTMLButtonElement>,
    tool: string
  ) => void;
  metadata?: TaskMetadata | null;
};

export const SettingsAccordion = forwardRef<HTMLDivElement, PropsType>(
  (
    {
      taskPubkey,
      isOpen,
      globalAndTaskVariables,
      onTaskToolsValidationCheck,
      onCloseAccordionView,
      onOpenAddTaskVariableModal,
      metadata,
    },
    ref
  ) => {
    return (
      <div
        className={`w-full col-span-9 overflow-y-auto overflow-x-hidden inner-scrollbar ${
          isOpen ? 'opacity-1 pt-6 max-h-[4000px]' : 'opacity-0 max-h-0'
        } transition-all duration-500 ease-in-out`}
      >
        <div ref={ref} className="flex w-full pl-4">
          <TaskSettings
            metadata={metadata}
            taskPubKey={taskPubkey}
            onToolsValidation={onTaskToolsValidationCheck}
            taskVariables={globalAndTaskVariables}
            onPairingSuccess={onCloseAccordionView}
            onOpenAddTaskVariableModal={onOpenAddTaskVariableModal}
            wrapperClasses="max-h-[390px] overflow-y-auto"
          />
        </div>
      </div>
    );
  }
);

SettingsAccordion.displayName = 'SettingsAccordion';
