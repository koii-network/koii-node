import config from 'config';
import { PaginatedResponse, Task } from 'models';
import { GetAvailableTasksParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (
  params: GetAvailableTasksParam
): Promise<PaginatedResponse<Task>> =>
  sendMessage(config.endpoints.GET_AVAILABLE_TASKS, params);
