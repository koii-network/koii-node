import { app, Event } from 'electron';

export const appRelaunch = async (_: Event) => {
  app.relaunch();
  app.quit();
};
