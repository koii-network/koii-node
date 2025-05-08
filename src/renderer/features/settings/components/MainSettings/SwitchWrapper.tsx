import React, { FunctionComponent } from 'react';
import { twMerge } from 'tailwind-merge';

type PropsType = {
  title: string;
  switchComponent: FunctionComponent;
  className?: string;
  highlight?: boolean;
};

export function SwitchWrapper({
  title,
  switchComponent: SwitchComponent,
  className,
  highlight = false,
}: PropsType) {
  return (
    <div
      className={twMerge(
        'flex flex-col items-center rounded-[4px] bg-[#BEF0ED] bg-opacity-20 gap-2 p-4 px-10',
        'transition-all duration-500',
        className,
        'w-293px h-[91px]',
        highlight
          ? '[animation:pulse_1s_ease-in-out_2] bg-finnieEmerald-light/30 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
          : ''
      )}
    >
      <span className="font-semibold">{title}</span>
      <SwitchComponent />
    </div>
  );
}
