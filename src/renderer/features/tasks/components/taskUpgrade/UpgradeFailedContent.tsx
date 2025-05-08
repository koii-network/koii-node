import { WarningTriangleLine } from '@_koii/koii-styleguide';
import React from 'react';

import { openMainLogs } from 'renderer/utils';

interface UpgradeFailedContentProps {
  retryUpgrade: () => void;
}

export function UpgradeFailedContent({
  retryUpgrade,
}: UpgradeFailedContentProps) {
  const linkClasses = 'underline text-finnieTeal-100';

  return (
    <>
      <WarningTriangleLine className="w-8 h-8 text-finnieRed" />
      <div className="col-span-6 col-start-2 text-left text-base">
        Oops, something&apos;s not quite right.{' '}
        <button className={linkClasses} onClick={openMainLogs}>
          Get the logs
        </button>{' '}
        or{' '}
        <button onClick={retryUpgrade} className={linkClasses}>
          try again
        </button>
        .
      </div>
    </>
  );
}
