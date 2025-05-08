import { Event } from 'electron';

import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const purgeNotifications = async (event: Event) => {
  try {
    await namespaceInstance.storeSet(
      SystemDbKeys.Notifications,
      JSON.stringify([])
    );
  } catch (err) {
    console.log('ERROR', err);
    throw err;
  }
};
