import React from 'react';

import CheckMarkTealIcon from 'assets/svgs/checkmark-teal-icon.svg';

interface UpgradeSucceededContentProps {
  newTaskVersionName: string;
}

export function UpgradeSucceededContent({
  newTaskVersionName,
}: UpgradeSucceededContentProps) {
  return (
    <>
      <CheckMarkTealIcon className="w-12 h-12" />{' '}
      <div className="col-start-2 col-span-6 text-left text-base">
        All set!{' '}
        <span className="text-finnieEmerald-light">{newTaskVersionName}</span>{' '}
        is running smoothly.
      </div>
    </>
  );
}
