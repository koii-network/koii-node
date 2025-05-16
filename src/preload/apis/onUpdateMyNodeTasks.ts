import { IpcRendererEvent, ipcRenderer } from 'electron';

import { RendererEndpoints } from 'config/endpoints';

export default function onUpdateMyNodeTasks(
  callback: (event: IpcRendererEvent, ...args: any[]) => void
) {
  ipcRenderer.removeAllListeners(RendererEndpoints.UPDATE_MY_NODE_TASKS);
  ipcRenderer.on(RendererEndpoints.UPDATE_MY_NODE_TASKS, callback);
}
