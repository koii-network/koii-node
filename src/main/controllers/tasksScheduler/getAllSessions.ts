import { ScheduleMetadata } from 'models';

import { taskScheduler } from '../../tasks-scheduler';

export const getAllSessions = async (): Promise<ScheduleMetadata[]> => {
  return taskScheduler.getSchedulesFromDb();
};
