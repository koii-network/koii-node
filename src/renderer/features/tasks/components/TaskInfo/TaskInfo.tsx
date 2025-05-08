import React, { RefObject, useMemo } from 'react';

import { TaskPairing } from 'models';
import { TaskMetadata } from 'models/task';
import { useAverageSlotTime } from 'renderer/features/common';
import { formatRoundTimeWithFullUnit } from 'renderer/utils';

import { useTaskRoundTime } from '../../hooks/useRoundTime';
import { formatNumber } from '../../utils';

import { TaskActions } from './components/TaskActions';
import { TaskDescription } from './components/TaskDescription';
import { TaskStats } from './components/TaskStats';
import { UpgradeInfo } from './components/UpgradeInfo';
import { Setting } from './Setting';

export type TaskStatsDataType = {
  nodesNumber: number;
  minStake: number;
  myStake?: number;
  topStake: number;
  bounty: number;
  totalStakeInKoii?: number;
  roundTime?: number;
};

type PropsType = {
  publicKey: string;
  creator: string;
  metadataCID: string;
  metadata?: TaskMetadata;
  details: TaskStatsDataType;
  variables?: TaskPairing[];
  shouldDisplayToolsInUse?: boolean;
  showSourceCode?: boolean;
  isRunning?: boolean;
  isUpgradeInfo?: boolean;
  onOpenAddTaskVariableModal?: (
    dropdownRef: RefObject<HTMLButtonElement>,
    settingName: string
  ) => void;
  shouldDisplayArchiveButton?: boolean;
  isOnboardingTask?: boolean;
  tokenTicker?: string;
};

export function TaskInfo({
  publicKey,
  metadata,
  details: {
    nodesNumber,
    myStake,
    topStake,
    bounty,
    totalStakeInKoii,
    roundTime,
  },
  variables,
  shouldDisplayToolsInUse,
  showSourceCode = true,
  isRunning,
  isUpgradeInfo,
  onOpenAddTaskVariableModal,
  shouldDisplayArchiveButton,
  tokenTicker,
}: PropsType) {
  const { data: averageSlotTime } = useAverageSlotTime();
  const parsedRoundTime = useTaskRoundTime({
    roundTimeInMs: roundTime || 0,
    averageSlotTime,
  });
  const fullRoundTime =
    parsedRoundTime &&
    formatRoundTimeWithFullUnit({ ...parsedRoundTime, useShortUnits: true });

  const taskStatistics = useMemo(
    () => [
      { label: 'Token', value: tokenTicker },
      ...(myStake !== undefined
        ? [
            {
              label: 'My Stake',
              value: `${formatNumber(myStake, false)}`,
              fullValue: myStake,
            },
          ]
        : []),
      {
        label: 'Bounty',
        value: `${formatNumber(bounty, false)}`,
        fullValue: bounty,
      },
      {
        label: 'Top Stake',
        value: `${formatNumber(topStake, false)}`,
        fullValue: topStake,
      },
      {
        label: 'Total Stake',
        value: totalStakeInKoii ? formatNumber(totalStakeInKoii, false) : 0,
        fullValue: totalStakeInKoii,
      },
      { label: 'Nodes', value: nodesNumber },
      ...(roundTime !== undefined
        ? [
            {
              label: 'Round Time',
              value: fullRoundTime,
            },
          ]
        : []),
    ],
    [
      bounty,
      nodesNumber,
      topStake,
      totalStakeInKoii,
      myStake,
      roundTime,
      fullRoundTime,
    ]
  );

  return (
    <div className="flex flex-col w-full gap-4 pl-3 pr-5 cursor-default">
      <UpgradeInfo
        isUpgradeInfo={isUpgradeInfo}
        migrationDescription={metadata?.migrationDescription}
      />

      <div className="flex justify-between">
        <div className="flex flex-col gap-8 max-w-[80%]">
          <TaskDescription
            description={metadata?.description}
            taskId={publicKey}
          />
        </div>

        <TaskActions
          publicKey={publicKey}
          showSourceCode={showSourceCode}
          repositoryUrl={metadata?.repositoryUrl}
          shouldDisplayArchiveButton={shouldDisplayArchiveButton}
          moreInfoLink={metadata?.infoUrl}
        />
      </div>

      <TaskStats taskStatistics={taskStatistics} />

      {/* <div className="flex justify-between w-full mb-6 text-start">
        <div className={taskSpecificationClass}>
          <div className="mb-2 text-base font-semibold">Specifications</div>
          <div className={gridClass}>
            {specs?.map(({ type, value }, index) => (
              <div key={index} className="select-text">
                {type}: {value ?? NOT_AVAILABLE_PLACEHOLDER}
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {shouldDisplayToolsInUse && !!variables?.length && (
        <div>
          <div
            className="mb-2 text-base font-semibold"
            id={`task-settings-${publicKey}`}
          >
            Extensions
          </div>
          {/* Adjust the grid-cols class as needed for different breakpoints */}
          <div className="flex flex-wrap w-full gap-x-6">
            {variables?.map(({ name, label }) => (
              <Setting
                publicKey={publicKey}
                isRunning={isRunning}
                key={name}
                name={name}
                label={label}
                onOpenAddTaskVariableModal={onOpenAddTaskVariableModal}
                isEditDisabled={isUpgradeInfo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
