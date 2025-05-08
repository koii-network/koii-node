import { ExternalNotificationDisplayConditionsType } from '../types';

type RequiredDataType = {
  appVersion: string;
};

export const getShouldDisplayNotification = (
  conditions?: ExternalNotificationDisplayConditionsType,
  requiredData?: RequiredDataType
) => {
  if (conditions) {
    if (conditions.version) {
      if (requiredData?.appVersion !== conditions.version) {
        return false;
      }
    }

    if (conditions.excludeAppVersions) {
      if (
        requiredData?.appVersion &&
        conditions.excludeAppVersions.includes(requiredData?.appVersion)
      ) {
        return false;
      }
    }
  }

  return true;
};
