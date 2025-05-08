import { Icon } from '@_koii/koii-styleguide';
import React from 'react';

import CodeIcon from 'assets/svgs/embed-icon.svg';
import { Tooltip } from 'renderer/components/ui';
import { openBrowserWindow } from 'renderer/services';
import { formatUrl, isValidUrl } from 'utils';

type PropsType = {
  repositoryUrl: string;
};

export function SourceCodeButton({ repositoryUrl }: PropsType) {
  const fullUrl = formatUrl(repositoryUrl);
  const isValidRepositoryUrl = isValidUrl(fullUrl);
  const buttonClasses = `flex flex-col items-center w-fit ${
    isValidRepositoryUrl
      ? 'cursor-pointer hover:underline text-finnieEmerald-light'
      : 'cursor-not-allowed text-finnieGray-secondary'
  }`;

  const showSourceCodeInRepository = () => {
    openBrowserWindow(fullUrl);
  };

  return (
    <button
      className={buttonClasses}
      onClick={showSourceCodeInRepository}
      disabled={!isValidRepositoryUrl}
    >
      <Tooltip
        tooltipContent="Repository URL is missing or invalid"
        forceHide={isValidRepositoryUrl}
        placement="bottom-left"
      >
        <div className="flex gap-2 items-center">
          <Icon source={CodeIcon} className="w-6 h-6" />
          <p>Inspect code</p>
        </div>
      </Tooltip>
    </button>
  );
}
