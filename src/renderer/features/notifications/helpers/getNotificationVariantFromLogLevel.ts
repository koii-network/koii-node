import { NotificationVariantType } from '../types';

export const getNotificationVariantFromLogLevel = (
  logLevel: string
): NotificationVariantType => {
  switch (logLevel) {
    case 'log':
      return 'INFO';
    case 'warn':
      return 'WARNING';
    case 'error':
      return 'ERROR';
    default:
      return 'INFO';
  }
};
