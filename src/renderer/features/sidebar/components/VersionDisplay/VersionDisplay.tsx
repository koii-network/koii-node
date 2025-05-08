import React from 'react';

import { useAppVersion } from 'renderer/features/common';

export function VersionDisplay() {
  const { appVersion } = useAppVersion();

  return (
    <div className="p-2 mt-2 text-sm text-white">
      Version {appVersion ?? ''}
    </div>
  );
}
