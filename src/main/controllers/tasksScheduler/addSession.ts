import { ScheduleMetadata } from 'models';

import { taskScheduler } from '../../tasks-scheduler';

export const addSession = async (_: Event, payload: ScheduleMetadata) => {
  taskScheduler.setTaskSchedule(payload);
};
