import config from 'config';
import { ScheduleMetadata } from 'models';
import sendMessage from 'preload/sendMessage';

export default (payload: {
  id: string;
}): Promise<ScheduleMetadata | undefined> =>
  sendMessage(config.endpoints.GET_TASKS_SCHEDULE_BY_ID, payload);
