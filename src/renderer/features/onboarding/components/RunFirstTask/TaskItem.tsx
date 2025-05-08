import { Icon, InformationCircleLine } from '@_koii/koii-styleguide';
import React, {
  MouseEventHandler,
  MutableRefObject,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';

import { Button } from 'renderer/components/ui';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { useClipboard, useOnClickOutside } from 'renderer/features/common';
import { useMetadata } from 'renderer/features/tasks';
import { TaskInfo } from 'renderer/features/tasks/components/TaskInfo';
import { useTaskStatsData } from 'renderer/features/tasks/hooks/useTaskStatsData';
import { Task } from 'renderer/types';
import { Theme } from 'renderer/types/common';
import { getKoiiFromRoe } from 'utils';

import { EditStakeInput } from './EditStakeInput';

type PropsType = {
  stakeValue: number;
  index: number;
  onStakeInputChange: (newStake: number) => void;
  onRemove: () => void;
  task: Task;
  setShowMinimumStakeError: React.Dispatch<React.SetStateAction<boolean>>;
};

function TaskItem({
  stakeValue,
  onStakeInputChange,
  index,
  task,
  setShowMinimumStakeError,
}: PropsType) {
  const [meetsMinimumStake, setMeetsMinimumStake] = useState<boolean>(false);
  const [accordionView, setAccordionView] = useState<boolean>(false);
  const [editStakeView, setEditStakeView] = useState<boolean>(false);
  const { metadata } = useMetadata({
    metadataCID: task.metadataCID,
    taskPublicKey: task.publicKey,
  });
  const taskInfo = useTaskStatsData(task.publicKey);
  const { copyToClipboard } = useClipboard();

  const minStakeInKoii = getKoiiFromRoe(task.minimumStakeAmount);
  const stakeValueInKoii = getKoiiFromRoe(stakeValue);

  const isFirstRowInTable = index === 0;
  const handleStakeInputChange = (newStake: number) => {
    setMeetsMinimumStake(newStake >= task.minimumStakeAmount);
    setShowMinimumStakeError(newStake <= task.minimumStakeAmount);
    onStakeInputChange(newStake);
  };

  const handleChangeStakeView = () => {
    setEditStakeView(!editStakeView);
  };

  const details = {
    nodesNumber: taskInfo?.totalNodes ?? 0,
    minStake: getKoiiFromRoe(task.minimumStakeAmount),
    topStake: getKoiiFromRoe(taskInfo.topStake ?? 0),
    bounty: getKoiiFromRoe(taskInfo?.totalBounty ?? 0),
    totalStakeInKoii: getKoiiFromRoe(taskInfo?.totalStake ?? 0),
  };

  const handleCopyCreatorAddress = () => {
    copyToClipboard(task.taskManager);
    toast.success('Creators address copied!');
  };

  const accordionClasses = `p-6 rounded-lg transition-all duration-500 ease-in-out overflow-hidden ${
    accordionView ? 'opacity-1 max-h-[4000px]' : 'opacity-0 max-h-0'
  }`;

  const ref = useRef<HTMLDivElement>(null);

  const handleToggleInfoAccordion: MouseEventHandler = (event) => {
    const target = event.target as HTMLElement;
    // Don't trigger if clicking on input element or its container
    if (
      target.tagName.toLowerCase() === 'input' ||
      target.closest('[data-stake-input]')
    ) {
      event.stopPropagation();
      return;
    }

    setAccordionView(!accordionView);
  };

  useOnClickOutside(ref as MutableRefObject<HTMLDivElement>, () =>
    setAccordionView(false)
  );

  return (
    <div
      className="w-full relative"
      ref={ref}
      onClick={handleToggleInfoAccordion}
    >
      <div className="sticky top-0 z-[10] mb-1">
        <div className="grid w-full text-left rounded-md bg-finnieBlue-light-secondary h-13 grid-cols-first-task place-content-center cursor-pointer">
          <div className="col-span-2 m-auto">
            <Popover
              theme={Theme.Light}
              tooltipContent={`${
                accordionView ? 'Close task details' : 'Open task details'
              }`}
            >
              <div className="flex flex-col items-center justify-start">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleInfoAccordion(e);
                  }}
                  icon={
                    <Icon
                      source={InformationCircleLine}
                      size={24}
                      className={`${
                        accordionView
                          ? 'text-finnieEmerald-light'
                          : 'text-white'
                      }`}
                    />
                  }
                  className="outline-none"
                  onlyIcon
                />
              </div>
            </Popover>
          </div>

          <div className="col-span-6 my-auto cursor-pointer">
            <Popover
              theme={Theme.Light}
              tooltipContent={
                <p>
                  This task was created by the Koii team and is safe to run.
                </p>
              }
            >
              {task.taskName}
            </Popover>
          </div>
          <div className="flex items-center col-span-6">
            <Popover
              theme={Theme.Light}
              tooltipContent={<p>{task.taskManager}</p>}
            >
              <div className="max-w-[150px] xl:max-w-[200px] w-full flex flex-col overflow-hidden text-ellipsis">
                <button
                  className="overflow-hidden text-ellipsis"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCreatorAddress();
                  }}
                >
                  {task.taskManager}
                </button>
              </div>
            </Popover>
          </div>

          <div className="col-span-4 2xl:col-start-15 2xl:col-span-4">
            <EditStakeInput
              stake={stakeValue}
              onChange={handleStakeInputChange}
              meetsMinimumStake={meetsMinimumStake}
              handleChangeStakeView={handleChangeStakeView}
            />
          </div>
        </div>
        <div className="grid grid-cols-first-task w-full mb-1.5 mt-1">
          <div className="col-span-4 text-xs leading-4 text-left col-start-15 text-finnieEmerald-light">
            minimum: {minStakeInKoii}
          </div>
        </div>
      </div>
      <div className={accordionClasses}>
        <div className="max-h-[24vh] md2h:max-h-[27vh] overflow-y-auto">
          <TaskInfo
            publicKey={task.publicKey}
            creator={task.taskManager}
            metadataCID={task.metadataCID}
            metadata={metadata ?? undefined}
            details={details}
            isOnboardingTask
            tokenTicker={task.taskType}
          />
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
