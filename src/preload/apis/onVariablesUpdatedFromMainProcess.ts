import { IpcRendererEvent, ipcRenderer } from 'electron';

import { RendererEndpoints } from 'config/endpoints';

export default function onVariablesUpdatedFromMainProcess(
  callback: (event: IpcRendererEvent, ...args: any[]) => void
) {
  ipcRenderer.removeAllListeners(RendererEndpoints.TASK_VARIABLES_UPDATED);
  ipcRenderer.on(RendererEndpoints.TASK_VARIABLES_UPDATED, callback);
}
