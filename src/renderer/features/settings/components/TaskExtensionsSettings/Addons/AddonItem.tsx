import { CheckSuccessLine, Icon, SettingsLine } from '@_koii/koii-styleguide';
import React from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';

import { Button, LoadingSpinner } from 'renderer/components/ui';
import { useOrcaContext } from 'renderer/features/orca/context/orca-context';
import { QueryKeys, openBrowserWindow } from 'renderer/services';

type PropsType = {
  name: string;
  description: string;
  logo?: any;
  url: string;
};

export function AddonItem({ name, description, logo, url }: PropsType) {
  const queryClient = useQueryClient();

  const mutation = useMutation(window.main.installPodmanAndOrcaMachine, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(QueryKeys.OrcaPodman);
    },
    onError: async (error) => {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('wsl')
      ) {
        toast.error('Please install WSL2 before installing ORCA');
        return;
      }
      console.error('Error installing Podman and ORCA', error);
      toast.error(
        "We couldn't install ORCA automatically, please install it manually"
      );
    },
  });
  const {
    data: { isPodmanInstalled, isOrcaVMInstalled },
  } = useOrcaContext();

  const handleInstallAddon = () => {
    mutation.mutate();
  };

  const isAddonInstalled = isPodmanInstalled && isOrcaVMInstalled;

  let downloadButtonLabel: string;

  const noWSL =
    mutation.error instanceof Error &&
    mutation.error.message.toLowerCase().includes('wsl not installed');

  const rebootRequired =
    mutation.error instanceof Error &&
    mutation.error.message.toLowerCase().includes('reboot required');

  if (rebootRequired) {
    downloadButtonLabel = 'Reboot required';
  } else if (noWSL) {
    downloadButtonLabel = 'Install WSL2 manually';
  } else if (mutation.isError) {
    downloadButtonLabel = 'Install ORCA manually';
  } else if (isAddonInstalled) {
    downloadButtonLabel = 'Installed';
  } else {
    downloadButtonLabel = 'Install ORCA';
  }
  let downloadButtonAction: () => void;

  const disableButton = rebootRequired || noWSL || isAddonInstalled;

  if (disableButton) {
    downloadButtonAction = () => null;
  } else if (mutation.isError) {
    downloadButtonAction = () => openBrowserWindow(url);
  } else {
    downloadButtonAction = handleInstallAddon;
  }

  const DownloadButtonIcon = isAddonInstalled ? CheckSuccessLine : SettingsLine;

  const noWSLDescription =
    'ORCA on Windows requires the use of WSL (Windows Subsystem for Linux) 2, an optional windows feature. To install:\n1. Run the following command: in a command prompt with administrator privileges: wsl --install --no-distribution\n2. Reboot your computer if prompted\n3. Return here and try installing ORCA again';

  const rebootRequiredDescription =
    'As part of the Orca installation, we have enabled a Windows feature called WSL. Please reboot your computer to complete the installation, then return here to finish installing ORCA.';

  let descriptionText = description;
  if (rebootRequired) {
    descriptionText = rebootRequiredDescription;
  } else if (noWSL) {
    descriptionText = noWSLDescription;
  }

  return (
    <div>
      <div className="p-6 rounded-md bg-purple-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-2xl font-semibold text-left">
            {logo && <img width={130} height={130} src={logo} alt="ORCA" />}
            <span>{name}</span>
          </div>
          {mutation.isLoading ? (
            <div className="w-52">
              <LoadingSpinner className="mx-auto" />
            </div>
          ) : (
            <Button
              label={downloadButtonLabel}
              icon={<Icon source={DownloadButtonIcon} className="w-5" />}
              onClick={downloadButtonAction}
              disabled={mutation.isLoading || disableButton}
              className="font-semibold bg-white text-finnieBlue-light text-[14px] leading-[14px] min-w-[200px] w-fit px-6 h-9 self-end"
              loading={mutation.isLoading}
            />
          )}
        </div>

        <div>
          {descriptionText.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
          <div className="mt-4">
            If you have any questions, please get in touch on{' '}
            <button
              className="inline-flex items-center"
              onClick={() =>
                openBrowserWindow('https://discord.com/invite/koii-network')
              }
            >
              <div className="text-white underline hover:no-underline">
                Discord
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
