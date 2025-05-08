import { AddLine, Icon } from '@_koii/koii-styleguide';
import React from 'react';

type PropsType = {
  onClick: () => void;
};

export function AddSessionButton({ onClick }: PropsType) {
  return (
    <button className="flex items-center gap-3 px-4 py-2" onClick={onClick}>
      <Icon source={AddLine} size={18} color="#9BE7C4" />
      <div className="text-sm font-semibold underline underline-offset-2 text-green-2">
        Add Session
      </div>
    </button>
  );
}
