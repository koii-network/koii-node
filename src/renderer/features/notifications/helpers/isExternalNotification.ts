/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotificationVariantType } from '../types';

export type ExternalNotificationDisplayConditionsType = {
  version?: string;
  excludeAppVersions?: string[];
};

export type ExternalNotification = {
  id: string;
  text: string;
  title: string;
  type: NotificationVariantType;
  ctaLink: string;
  ctaText: string;
  persist?: boolean;
  conditions?: ExternalNotificationDisplayConditionsType;
};

export function isExternalNotification(
  data: any
): data is ExternalNotification {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const requiredStringProps = ['id', 'text', 'title', 'ctaLink', 'ctaText'];
  const requiredPropsExist = requiredStringProps.every(
    (prop) => typeof data[prop] === 'string'
  );

  const typeIsValid = typeof data.type === 'string';
  const persistIsValid =
    data.persist === undefined || typeof data.persist === 'boolean';

  const conditionsIsValid =
    data.conditions === undefined ||
    (typeof data.conditions === 'object' &&
      (data.conditions.version === undefined ||
        typeof data.conditions.version === 'string') &&
      (data.conditions.excludeAppVersions === undefined ||
        (Array.isArray(data.conditions.excludeAppVersions) &&
          data.conditions.excludeAppVersions.every(
            (v: any) => typeof v === 'string'
          ))));

  return (
    requiredPropsExist && typeIsValid && persistIsValid && conditionsIsValid
  );
}
