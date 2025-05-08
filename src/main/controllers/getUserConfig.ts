import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { getUserConfigResponse } from 'models/api';

import { ErrorType } from '../../models';
import { throwDetailedError } from '../../utils';

const getUserConfig = async (): Promise<getUserConfigResponse> => {
  try {
    const userConfigStringified: string = await namespaceInstance.storeGet(
      SystemDbKeys.UserConfig
    );
    const userConfig = JSON.parse(
      userConfigStringified
    ) as getUserConfigResponse;
    return userConfig;
  } catch (err: any) {
    console.error('GET USER CONFIG', err);
    return throwDetailedError({
      detailed: err,
      type: ErrorType.GENERIC,
    });
  }
};

export default getUserConfig;
