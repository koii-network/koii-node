import config from 'config';
import { TaskStartStopParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: TaskStartStopParam): Promise<void> =>
  sendMessage(config.endpoints.STOP_TASK, payload);
