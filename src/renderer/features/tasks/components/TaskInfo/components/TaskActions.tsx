import {
  Button,
  CheckSuccessLine,
  CopyLine,
  Icon,
  InformationCircleLine,
} from '@_koii/koii-styleguide';
import React from 'react';

import Archive from 'assets/svgs/archive.svg';
import ExploreIcon from 'assets/svgs/explore-icon.svg';
import { SourceCodeButton } from 'renderer/components/SourceCodeButton';
import { LoadingSpinner } from 'renderer/components/ui';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { useClipboard } from 'renderer/features/common';
import useArchive from 'renderer/features/common/hooks/useArchive';
import { openBrowserWindow } from 'renderer/services';
import { Theme } from 'renderer/types/common';
import { formatUrl, isValidUrl } from 'utils';

import { Address } from '../../AvailableTaskRow/components/Address';
import { TurnSchedulerOnOffOnTask } from '../TurnSchedulerOnOffOnTask';

type PropsType = {
  publicKey: string;
  pendingRewards?: number;
  shouldDisplayArchiveButton?: boolean;
  showSourceCode?: boolean;
  repositoryUrl?: string;
  moreInfoLink?: string;
};

export function TaskActions({
  publicKey,
  pendingRewards,
  shouldDisplayArchiveButton,
  showSourceCode,
  repositoryUrl,
  moreInfoLink,
}: PropsType) {
  const { archiveTask, isArchivingTask } = useArchive({
    taskPublicKey: publicKey,
    pendingRewards,
  });

  const moreInfoUrl = moreInfoLink ?? repositoryUrl ?? '';
  const fullMoreInfoUrl = formatUrl(moreInfoUrl);
  const isValidMoreInfoUrl = isValidUrl(fullMoreInfoUrl);

  const showMoreInfo = () => openBrowserWindow(fullMoreInfoUrl);

  const { copyToClipboard: copyTaskId, copied: copiedTaskId } = useClipboard();

  const handleCopyTaskId = () => {
    copyTaskId(publicKey);
  };

  const tooltipContent = copiedTaskId ? 'Copied' : 'Copy';
  const IconSource = copiedTaskId ? CheckSuccessLine : CopyLine;
  const buttonClasses = ' flex rounded-full bg-transparent outline-none';

  return (
    <div className="flex flex-col items-end gap-2 min-w-[145px] ml-10">
      <TurnSchedulerOnOffOnTask taskPublicKey={publicKey} />

      {showSourceCode && (
        <SourceCodeButton repositoryUrl={repositoryUrl ?? ''} />
      )}

      <Address
        address={publicKey}
        overrideLabel={
          <div className="flex gap-2 items-center">
            <Icon source={ExploreIcon} className="w-6 h-6" />
            <span>Explore history</span>
          </div>
        }
        className="select-text"
      />

      {isValidMoreInfoUrl && (
        <button
          className="cursor-pointer hover:underline"
          onClick={showMoreInfo}
        >
          <div className="flex gap-3 items-center">
            <Icon source={InformationCircleLine} className="w-4 h-4" />
            <p>More Info</p>
          </div>
        </button>
      )}

      {shouldDisplayArchiveButton &&
        (isArchivingTask ? (
          <LoadingSpinner className="w-6 h-6 ml-auto" />
        ) : (
          <button
            className="flex gap-3 ml-auto text-right hover:underline"
            onClick={() => archiveTask()}
          >
            <Icon source={Archive} className="w-4 h-4" />
            Archive
          </button>
        ))}
      <div>
        <Popover theme={Theme.Dark} tooltipContent={tooltipContent}>
          <Button
            onClick={handleCopyTaskId}
            iconLeft={
              <Icon source={IconSource} className="h-4 w-4 text-white mr-3" />
            }
            // iconRight={IconSource}
            className={buttonClasses}
            label="Copy task ID"
          />
        </Popover>
      </div>
    </div>
  );
}
