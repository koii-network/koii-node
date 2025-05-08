import { CheckSuccessLine, CopyLine, Icon } from '@_koii/koii-styleguide';
import React from 'react';

import { Theme } from 'renderer/types/common';

import { Button } from '../Button';
import { Popover } from '../Popover/Popover';

interface CopyButtonProps {
  onCopy: () => void;
  isCopied: boolean;
  className?: string;
}

export function CopyButton({
  onCopy,
  isCopied,
  className = '',
}: CopyButtonProps) {
  const tooltipContent = isCopied ? 'Copied!' : 'Copy address';
  const iconSource = isCopied ? CheckSuccessLine : CopyLine;
  const buttonClasses = `rounded-full w-4 h-4 bg-transparent outline-none ${className}`;

  return (
    <Popover theme={Theme.Dark} tooltipContent={tooltipContent}>
      <Button
        onClick={onCopy}
        icon={<Icon source={iconSource} className="h-4 w-4 text-white" />}
        className={buttonClasses}
      />
    </Popover>
  );
}
