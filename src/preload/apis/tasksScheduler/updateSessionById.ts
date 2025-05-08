import config from 'config';
import { ScheduleMetadataUpdateType } from 'models';
import sendMessage from 'preload/sendMessage';

export default (payload: ScheduleMetadataUpdateType): Promise<void> =>
  sendMessage(config.endpoints.UPDATE_TASKS_SCHEDULE_BY_ID, payload);
