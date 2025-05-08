import { ExtentionPuzzleLine, Icon } from '@_koii/koii-styleguide';
import React from 'react';

export function OrcaTag() {
  return (
    <div className="flex gap-1 mt-[2px] items-center">
      <Icon
        source={ExtentionPuzzleLine}
        className="w-4 h-4 text-finnieOrange"
      />
      <span className="text-sm font-normal text-finnieOrange">ORCA</span>
    </div>
  );
}
