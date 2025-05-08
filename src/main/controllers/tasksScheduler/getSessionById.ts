import { ScheduleMetadata } from 'models';

import { taskScheduler } from '../../tasks-scheduler';

export const getSessionById = async (
  _: Event,
  payload: { id: string }
): Promise<ScheduleMetadata | undefined> => {
  const { id } = payload;

  return taskScheduler.getSchedule(id);
};
