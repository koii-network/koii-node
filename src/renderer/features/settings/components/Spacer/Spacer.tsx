import React from 'react';
import { twMerge } from 'tailwind-merge';

const sizes = {
  xs: 'my-2',
  sm: 'my-4',
  md: 'my-6',
  lg: 'my-8',
};

type Size = keyof typeof sizes;

type PropsType = {
  size?: Size;
  showSeparator?: boolean;
};

const getSize = (size: Size) => sizes[size];

export function Spacer({ size = 'md', showSeparator = false }: PropsType) {
  const classes = twMerge(
    'flex-grow',
    getSize(size),
    showSeparator && 'border-b-[1px] border-purple-1'
  );

  return <div className={classes} />;
}
