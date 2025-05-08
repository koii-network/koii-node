import React from 'react';
import { twMerge } from 'tailwind-merge';

type PropsType = {
  children: React.ReactNode;
  className?: string;
};

export function InfoBox({ children, className }: PropsType) {
  const classNames = twMerge(
    'flex flex-col text-white w-[186px] xl:w-[230px] md2:w-[350px] xl1:w-[450px] xl2:w-[550px] rounded bg-finnieBlue-light-secondary p-2 transition-all duration-300 ease-in-out',
    className || ''
  );

  return <div className={classNames}>{children}</div>;
}
