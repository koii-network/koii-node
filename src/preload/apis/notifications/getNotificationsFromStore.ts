import config from 'config';
import { GetNotificationsResponse } from 'models';
import sendMessage from 'preload/sendMessage';

export const getNotificationsFromStore =
  async (): Promise<GetNotificationsResponse> => {
    return sendMessage(config.endpoints.GET_NOTIFICATIONS, {});
  };
