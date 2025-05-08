import { AddLine, Icon } from '@_koii/koii-styleguide';
import React from 'react';

type PropsType = {
  onClick: () => void;
};

export function AdvancedButton({ onClick }: PropsType) {
  return (
    <button className="flex items-center gap-4" onClick={onClick}>
      <Icon source={AddLine} size={18} color="#5ED9D1" />
      <div className="text-sm text-white">Advanced</div>
    </button>
  );
}
