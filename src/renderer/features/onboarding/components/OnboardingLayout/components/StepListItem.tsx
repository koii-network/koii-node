import React from 'react';

type PropsType = {
  text: string;
  iconSlot: React.ReactNode;
  isActive?: boolean;
};

function StepListItem({ text, iconSlot, isActive }: PropsType) {
  return (
    <div
      className={`flex flex-row items-center gap-3 ${
        isActive ? 'text-finnieOrange' : ''
      }`}
    >
      {iconSlot}
      <span>{text}</span>
    </div>
  );
}

export default StepListItem;
