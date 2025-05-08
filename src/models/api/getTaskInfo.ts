import { TaskData } from '../task';

export interface GetTaskInfoParam {
  taskAccountPubKey: string;
  forceTaskRefetch?: boolean;
}

export type GetTaskInfoResponse = TaskData;
