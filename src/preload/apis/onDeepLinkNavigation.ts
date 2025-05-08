import { IpcRendererEvent, ipcRenderer } from 'electron';

import { RendererEndpoints } from 'config/endpoints';

export default function onDeepLinkNavigation(
  payload: (event: IpcRendererEvent, route: string) => void
) {
  ipcRenderer.on(RendererEndpoints.NAVIDATE_TO_ROUTE, payload);
  return () =>
    ipcRenderer.removeAllListeners(RendererEndpoints.NAVIDATE_TO_ROUTE);
}
