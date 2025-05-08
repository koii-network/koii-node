import React, { memo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Theme } from 'renderer/types/common';

type PropTypes = {
  children: React.ReactNode;
  onClose?: () => void;
  theme?: Theme;
  className?: string;
};

function ModalContent({ children, theme = Theme.Light, className }: PropTypes) {
  const classes = twMerge(
    'h-fit py-1 rounded text-center',
    theme === Theme.Dark && 'bg-finnieBlue-light-secondary',
    theme === Theme.Light && 'bg-finnieGray',
    className
  );

  return <div className={classes}>{children}</div>;
}

export default memo(ModalContent);
