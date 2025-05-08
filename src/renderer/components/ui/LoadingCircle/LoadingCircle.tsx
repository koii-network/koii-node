import React from 'react';
import { twMerge } from 'tailwind-merge';

export enum LoadingCircleSize {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  XLarge = 'XLarge',
}

type PropsType = {
  size?: LoadingCircleSize;
  className?: string;
};

const getSizeClasses = (size: LoadingCircleSize) => {
  const sizes = {
    [LoadingCircleSize.Small]: 'w-4 h-4',
    [LoadingCircleSize.Medium]: 'w-6 h-6',
    [LoadingCircleSize.Large]: 'w-8 h-8',
    [LoadingCircleSize.XLarge]: 'w-20 h-20',
  }[size];
  return sizes;
};

export function LoadingCircle({
  size = LoadingCircleSize.Medium,
  className,
}: PropsType) {
  const sizeClasses = getSizeClasses(size);

  const classes = twMerge(
    'w-3 h-3 border border-transparent rounded-full border-t-finnieTeal-100 border-r-finnieTeal-100 animate-spin',
    sizeClasses,
    className
  );

  return <span className={classes} />;
}
