import config from 'config';
import { GetTaskMetadataParam, TaskMetadata } from 'models';
import sendMessage from 'preload/sendMessage';

export default (payload: GetTaskMetadataParam): Promise<TaskMetadata> =>
  sendMessage(config.endpoints.GET_TASK_METADATA, payload);
