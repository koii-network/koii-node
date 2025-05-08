import { ScheduleMetadata } from 'models';

import { taskScheduler } from '../../tasks-scheduler';

export const updateSessionById = async (
  _: Event,
  payload: ScheduleMetadata
) => {
  return taskScheduler.updateTaskSchedule(payload);
};
