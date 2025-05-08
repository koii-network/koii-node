import { app as _app, App } from 'electron';

interface ExtendedApp extends App {
  isQuitting: boolean;
}

export const app: ExtendedApp = Object.assign(_app, {
  isQuitting: false,
});
