import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { ErrorType } from 'models';
import { GetNotificationsResponse } from 'models/api';
import { throwDetailedError } from 'utils';

export const getNotificationsFromStore =
  async (): Promise<GetNotificationsResponse> => {
    try {
      const userConfigStringified: string =
        (await namespaceInstance.storeGet(SystemDbKeys.Notifications)) ?? '[]';

      const userConfig = JSON.parse(
        userConfigStringified
      ) as GetNotificationsResponse;

      return userConfig;
    } catch (err: any) {
      console.error('GET NOTIFICATIONS', err);
      return throwDetailedError({
        detailed: err,
        type: ErrorType.GENERIC,
      });
    }
  };
