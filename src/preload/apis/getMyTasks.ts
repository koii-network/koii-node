import config from 'config';
import { PaginatedResponse, Task } from 'models';
import { GetMyTasksParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (params: GetMyTasksParam): Promise<PaginatedResponse<Task>> =>
  sendMessage(config.endpoints.GET_MY_TASKS, params);
