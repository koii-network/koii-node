import { CloseLine } from '@_koii/koii-styleguide';
import React, { useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { debounce } from 'lodash';
import {
  ScheduleMetadata,
  ScheduleMetadataUpdateType,
  TimeFormat,
} from 'models';
import { Button, Tooltip } from 'renderer/components/ui';

import { defaultSessionId } from '../../constants';
import { type ScheduleRefetchFuncType, useUpdateSession } from '../../hooks';
import { addTime, renderTimeToStartSessionToast } from '../../utils';
import { renderErrorToast } from '../../utils/toasts';
import { TimePicker } from '../TimePicker';
import { ToggleScheduleSwitch } from '../ToggleScheduleSwitch';
import { WeekDaySelect } from '../WeekDaysSelect';

type PropsType = {
  scheduleMetadata: ScheduleMetadata;
  disabled: boolean;
  onRemoveSessionClick: (sessionId: string) => void;
  refetchSchedules: ScheduleRefetchFuncType;
};

const DEFAULT_STOP_TIME_DIFFERENCE = '06:00:00';
const DEFAULT_TIME = '00:00:00';

export function Session({
  scheduleMetadata,
  disabled,
  onRemoveSessionClick,
  refetchSchedules,
}: PropsType) {
  const [showStopTimer, setShowStopTimer] = useState<boolean>(
    !!scheduleMetadata.stopTime
  );
  const [schedule, setSchedule] = useState<ScheduleMetadataUpdateType>(
    scheduleMetadata || {
      startTime: DEFAULT_TIME,
      stopTime: DEFAULT_TIME,
      days: [],
      isEnabled: false,
    }
  );

  const [hasError, setHasError] = useState(false);

  const updateSessionMutation = useUpdateSession({
    onSessionUpdateError(message) {
      setHasError(true);
      renderErrorToast(message);
    },
    onSessionUpdateSuccess(data) {
      setHasError(false);
      if (data.variables.startTime) {
        renderTimeToStartSessionToast(
          data.variables.startTime as TimeFormat,
          data.variables.days || []
        );
      }
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateSession = useCallback(
    debounce(async (newSchedule: ScheduleMetadataUpdateType) => {
      try {
        await updateSessionMutation.mutateAsync(newSchedule);
      } catch {
        console.log('Failed to update session');
      }
    }, 1500),
    []
  );

  const handleStartTimeChange = useCallback(
    (value: TimeFormat) => {
      setSchedule((oldSchedule) => {
        const changedSchedule = {
          ...oldSchedule,
          startTime: value,
        };

        debouncedUpdateSession(changedSchedule);
        return changedSchedule;
      });
    },
    [debouncedUpdateSession]
  );

  const handleStopTimeChange = useCallback(
    async (value: TimeFormat) => {
      try {
        setSchedule((oldSchedule) => {
          const changedSchedule = {
            ...oldSchedule,
            stopTime: value,
          };
          return changedSchedule;
        });

        const newSchedule = {
          stopTime: value,
          id: scheduleMetadata.id,
        };

        await debouncedUpdateSession(newSchedule);
        await refetchSchedules();
      } catch (error) {
        console.log(error);
      }
    },
    [debouncedUpdateSession, refetchSchedules, scheduleMetadata.id]
  );

  const handleSelectedDaysChange = useCallback(
    (value: number[]) => {
      setSchedule((oldSchedule) => {
        const changedSchedule = {
          ...oldSchedule,
          days: value,
        };

        debouncedUpdateSession(changedSchedule);
        return changedSchedule;
      });
    },
    [debouncedUpdateSession]
  );

  const handleRemoveSchedule = useCallback(() => {
    if (scheduleMetadata.id) {
      onRemoveSessionClick(scheduleMetadata.id);
    }
  }, [onRemoveSessionClick, scheduleMetadata.id]);

  const handleHideStopTimer = () => {
    setShowStopTimer(false);

    const changedSchedule = {
      ...schedule,
      stopTime: null,
    };
    setSchedule(changedSchedule);

    debouncedUpdateSession(changedSchedule);
  };

  const handleAddStopTimer = async () => {
    const stopTime = addTime(
      scheduleMetadata.startTime,
      DEFAULT_STOP_TIME_DIFFERENCE
    );

    await handleStopTimeChange(stopTime as TimeFormat);

    setShowStopTimer(true);
  };

  const disableClasses =
    (disabled && 'opacity-50 cursor-not-allowed pointer-events-none') || '';

  const wrapperClasses = twMerge(
    'flex items-center w-full gap-10 p-4 rounded-lg bg-finnieBlue-light-transparent justify-between border-2 border-transparent',
    disableClasses,
    hasError && 'border-finnieRed focus:border-finnieRed'
  );

  const displaySessionRemoveButton = scheduleMetadata.id !== defaultSessionId;

  return (
    <Tooltip
      forceHide={!disabled}
      placement="top-left"
      tooltipContent='Set your node to "Stay Awake" to use this feature'
      customTooltipWrapperClass="right-10 -top-[15px]"
    >
      <div className="flex items-center">
        <div className={wrapperClasses}>
          <div className="flex flex-wrap items-center gap-4 xl:gap-8">
            <div className="flex items-center gap-8">
              <TimePicker
                label="Start"
                onTimeChange={handleStartTimeChange}
                defaultValue={scheduleMetadata.startTime}
              />
              {showStopTimer ? (
                <TimePicker
                  label="Stop"
                  onTimeChange={handleStopTimeChange}
                  defaultValue={scheduleMetadata.stopTime || DEFAULT_TIME}
                  onHide={handleHideStopTimer}
                  autofocus
                />
              ) : (
                <div className="pb-2 mt-7">
                  <Button
                    label="Add stop time"
                    onClick={handleAddStopTimer}
                    className="text-white underline rounded-md bg-purple-light-transparent underline-offset-2 h-9 w-[180px] hover:text-green-2"
                  />
                </div>
              )}
            </div>

            <WeekDaySelect
              sessionId={scheduleMetadata.id}
              onSelectedDaysChange={handleSelectedDaysChange}
              defaultValue={scheduleMetadata.days}
            />
          </div>

          <div className="pr-6">
            <ToggleScheduleSwitch
              sessionId={scheduleMetadata.id}
              value={scheduleMetadata.isEnabled}
              disabled={hasError}
            />
          </div>
        </div>
        <div
          role="button"
          className={`p-2 w-5 ${disableClasses}`}
          tabIndex={0}
          onClick={handleRemoveSchedule}
          onKeyDown={(e) => e.key === 'Enter' && handleRemoveSchedule()}
        >
          {displaySessionRemoveButton && (
            <CloseLine className="w-5 h-5 text-white cursor-pointer" />
          )}
        </div>
      </div>
    </Tooltip>
  );
}
