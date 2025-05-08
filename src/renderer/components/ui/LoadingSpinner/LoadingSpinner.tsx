import React from 'react';
import { twMerge } from 'tailwind-merge';

import loadingIcon from 'assets/animations/loading-animation.gif';

export enum LoadingSpinnerSize {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  XLarge = 'XLarge',
}

type PropsType = {
  size?: LoadingSpinnerSize;
  className?: string;
};

const getSizeClasses = (size: LoadingSpinnerSize) => {
  const sizes = {
    [LoadingSpinnerSize.Small]: 'w-4 h-4',
    [LoadingSpinnerSize.Medium]: 'w-6 h-6',
    [LoadingSpinnerSize.Large]: 'w-8 h-8',
    [LoadingSpinnerSize.XLarge]: 'w-20 h-20',
  }[size];
  return sizes;
};

export function LoadingSpinner({
  size = LoadingSpinnerSize.Medium,
  className,
}: PropsType) {
  const sizeClasses = getSizeClasses(size);

  const classes = twMerge(sizeClasses, className);

  return (
    <div role="status">
      <img className={classes} src={loadingIcon} alt="loading" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
