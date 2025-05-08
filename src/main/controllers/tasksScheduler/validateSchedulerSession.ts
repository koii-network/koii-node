import { addDays, isBefore, parse } from 'date-fns';

import { type ScheduleMetadata } from 'models';

import { taskScheduler } from '../../tasks-scheduler';

export const validateSchedulerSession = async (
  _: Event,
  payload: ScheduleMetadata
) => {
  const { id, startTime, stopTime, days } = payload;
  const startParsed = parse(startTime, 'HH:mm:ss', new Date());
  let stopParsed = stopTime ? parse(stopTime, 'HH:mm:ss', new Date()) : null;

  if (stopParsed && isBefore(stopParsed, startParsed)) {
    // Adjust stopParsed to the next day
    stopParsed = addDays(stopParsed, 1);
  }

  return taskScheduler.checkIsScheduleInConflict(
    id,
    startParsed,
    stopParsed,
    days
  );
};
