import config from 'config';
import { ScheduleMetadata } from 'models';
import sendMessage from 'preload/sendMessage';

export default (): Promise<ScheduleMetadata[]> =>
  sendMessage(config.endpoints.GET_TASKS_SCHEDULES, {});
