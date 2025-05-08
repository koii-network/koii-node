import React from 'react';

import { NOT_AVAILABLE_PLACEHOLDER } from '../constants';

type PropsType = {
  migrationDescription?: string;
  isUpgradeInfo?: boolean;
};

export function UpgradeInfo({
  isUpgradeInfo,
  migrationDescription,
}: PropsType) {
  return isUpgradeInfo ? (
    <div className="text-start">
      <div className="mb-2 text-base font-semibold text-finnieEmerald-light">
        What&apos;s New
      </div>
      <p className="mb-4 text-sm select-text">
        {migrationDescription ?? NOT_AVAILABLE_PLACEHOLDER}
      </p>
    </div>
  ) : null;
}
