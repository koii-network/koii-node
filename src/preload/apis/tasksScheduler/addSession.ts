import config from 'config';
import { ScheduleMetadata } from 'models';
import sendMessage from 'preload/sendMessage';

export default (payload: Omit<ScheduleMetadata, 'id'>): Promise<void> =>
  sendMessage(config.endpoints.ADD_TASKS_SCHEDULE, payload);
