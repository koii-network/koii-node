import React from 'react';
import { useMutation } from 'react-query';

import { useAppVersion } from 'renderer/features/common/hooks/useAppVersion';
import { downloadAppUpdate, openBrowserWindow } from 'renderer/services';

import { useUpdateCheck } from '../../hooks';
import { usePlatformCheck } from '../../hooks/usePlatform';

export function ForceNodeUpdate() {
  const { checkForUpdates, isCheckingForTheUpdate, updateInfo } =
    useUpdateCheck();

  const { platformInfo, refetchPlatform } = usePlatformCheck();

  const mutation = useMutation(downloadAppUpdate);

  const [hasChecked, setHasChecked] = React.useState(false);

  const handleForceUpdate = async () => {
    setHasChecked(false);
    const updateInfo = await checkForUpdates();
    const platformInfo = await refetchPlatform();
    setHasChecked(true);

    console.log(platformInfo);

    if (!updateInfo) {
      console.log('No updates available.');
    }

    if (platformInfo.data?.image === 'unsupported') {
      openBrowserWindow('https://www.koii.network/node');
    }
  };

  const { appVersion } = useAppVersion();

  const thereIsAnUpdateAvailable =
    hasChecked && updateInfo && updateInfo?.version !== appVersion;

  const isAutoUpdateSupported =
    platformInfo && platformInfo.image === 'supported';

  return (
    <div className="text-right w-[280px]">
      <button
        onClick={handleForceUpdate}
        className="mb-2 text-sm underline text-finnieEmerald-light underline-offset-2"
      >
        Update Node to Latest Version
      </button>
      {mutation.isError && (
        <div className="text-sm text-finnieRed">
          An error occurred: {JSON.stringify(mutation.error)}
        </div>
      )}
      {isCheckingForTheUpdate && (
        <div className="text-sm text-white">Checking for update...</div>
      )}
      {hasChecked && !isAutoUpdateSupported && (
        <div className="text-sm text-white">
          Check the Koii website for an update!
        </div>
      )}
      {hasChecked && !thereIsAnUpdateAvailable && isAutoUpdateSupported && (
        <div className="text-sm text-white">No newer update available.</div>
      )}
      {thereIsAnUpdateAvailable && isAutoUpdateSupported && (
        <div className="text-sm text-white">
          Update to version {updateInfo?.version} available!
        </div>
      )}
      {mutation.isLoading && (
        <div className="text-sm text-white">Updating...</div>
      )}
    </div>
  );
}
