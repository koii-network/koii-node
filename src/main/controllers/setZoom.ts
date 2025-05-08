import { BrowserWindow } from 'electron';

export const setZoom = (_: Event, payload: { zoomLevel: number }) => {
  const window = BrowserWindow.getAllWindows()?.[0];
  if (!window) return false;
  const currentZoomLevel = window.webContents.getZoomLevel();
  console.log('new zoom level', currentZoomLevel + payload.zoomLevel);
  window.webContents.setZoomLevel(currentZoomLevel + payload.zoomLevel);
  return true;
};
