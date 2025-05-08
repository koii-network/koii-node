import config from 'config';
import { GetAvailableTasksParam, PaginatedResponse, Task } from 'models';
import sendMessage from 'preload/sendMessage';

export default (
  params: GetAvailableTasksParam
): Promise<PaginatedResponse<Task>> =>
  sendMessage(config.endpoints.GET_PRIVATE_TASKS, params);
