import { Event } from 'electron';

import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { StoreUserConfigParam } from 'models/api';

const storeUserConfig = async (
  event: Event,
  payload: StoreUserConfigParam
): Promise<boolean> => {
  const { settings } = payload;

  try {
    await namespaceInstance.storeSet(
      SystemDbKeys.UserConfig,
      JSON.stringify(settings)
    );
    return true;
  } catch (err) {
    console.log('ERROR', err);
    throw err;
  }
};

export default storeUserConfig;
