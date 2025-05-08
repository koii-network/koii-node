import { IpcRendererEvent, ipcRenderer } from 'electron';

import { RendererEndpoints } from 'config/endpoints';

export default function onTaskExecutableFileChange(
  callback: (event: IpcRendererEvent, ...args: any[]) => void
) {
  ipcRenderer.on(RendererEndpoints.TASK_EXECUTABLE_CHANGED, callback);
  return () =>
    ipcRenderer.removeAllListeners(RendererEndpoints.TASK_EXECUTABLE_CHANGED);
}
