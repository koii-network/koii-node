import { IpcRendererEvent, ipcRenderer } from 'electron';

import { LogLevel } from '@koii-network/task-node';
import { RendererEndpoints } from 'config/endpoints';

export type TaskNotificationPayloadType = {
  level: LogLevel;
  message: string;
  action: string | null;
  taskId: string;
  taskName: string;
};

export default function onTaskNotificationReceived(
  callback: (
    event: IpcRendererEvent,
    payload: TaskNotificationPayloadType
  ) => void
) {
  ipcRenderer.on(RendererEndpoints.TASK_NOTIFICATION_RECEIVED, callback);
  return () =>
    ipcRenderer.removeAllListeners(
      RendererEndpoints.TASK_NOTIFICATION_RECEIVED
    );
}
