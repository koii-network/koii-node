import React, { forwardRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type PropsType = {
  title: string;
  onClick: () => void;
  description: string;
  icon: React.ReactNode;
};

export const AddAccountAction = forwardRef<HTMLDivElement, PropsType>(
  ({ icon, title, description, onClick }, ref) => {
    const [hasFocus, setFocus] = useState(false);
    const classes = twMerge(
      'w-[700px] h-[68px] hover:bg-finnieBlue-light-tertiary active:hover:bg-finnieBlue-light-tertiary flex gap-6 rounded-lg text-white items-center px-5 cursor-pointer',
      hasFocus && 'bg-finnieBlue-light-tertiary'
    );

    const handleFocus = () => {
      setFocus(true);
    };

    const handleBlur = () => {
      setFocus(false);
    };

    return (
      <div
        tabIndex={1}
        ref={ref}
        className={classes}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={onClick}
      >
        {icon}
        <div className="flex flex-col items-start justify-start">
          <div className="font-semibold">{title}</div>
          <div className="text-xs">{description}</div>
        </div>
      </div>
    );
  }
);

AddAccountAction.displayName = 'AddAccountAction';
