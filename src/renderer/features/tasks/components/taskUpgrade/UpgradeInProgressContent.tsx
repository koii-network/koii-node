import React from 'react';

import UpdateIcon from 'assets/svgs/update-icon.svg';
import { LoadingSpinner } from 'renderer/components';

export function UpgradeInProgressContent() {
  return (
    <>
      <UpdateIcon className="text-finnieTeal-100" />
      <div className="flex col-span-4 col-start-2 text-left text-base select-none">
        Upgrade in process! It might take a few minutes.
      </div>
      <LoadingSpinner />
    </>
  );
}
