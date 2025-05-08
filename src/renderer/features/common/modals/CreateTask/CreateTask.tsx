import { create, useModal } from '@ebay/nice-modal-react';
import React from 'react';

import { useCloseWithEsc } from 'renderer/features/common/hooks/useCloseWithEsc';
import { Modal, ModalContent, ModalTopBar } from 'renderer/features/modals';
import { openBrowserWindow } from 'renderer/services';

export const CreateTaskModal = create(function CreateTaskModal() {
  const modal = useModal();

  const handleClose = () => {
    modal.remove();
  };

  useCloseWithEsc({ closeModal: handleClose });

  const linkClassNames =
    'text-finnieTeal-700 font-semibold underline inline-block cursor-pointer';

  const handleOpenKoiiSDKWindow = () =>
    openBrowserWindow(
      'https://docs.koii.network/develop/microservices-and-tasks/task-development-guide/'
    );

  const handleOpenDiscordServerWindow = () =>
    openBrowserWindow('https://discord.gg/koii-network');

  return (
    <Modal>
      <ModalContent>
        <ModalTopBar title="Create New Task" onClose={handleClose} />
        <div className="flex flex-col items-center pt-4 text-finnieBlue tracking-finnieSpacing-wider">
          <div className="text-2xl font-semibold  mb-2.5 leading-8">
            Create your own Koii Tasks
          </div>
          <div className="font-normal w-128 mb-6.25">
            The world&apos;s information is at your fingertips with the power of
            the Koii Network.
          </div>
          <div className="mb-1 font-semibold leading-7">
            Are you a developer?
          </div>
          <div className="font-normal mb-2.5">
            Head over to the{' '}
            <span className={linkClassNames} onClick={handleOpenKoiiSDKWindow}>
              Koii SDK
            </span>{' '}
            to learn how.
          </div>
          <div className="mb-1 font-semibold leading-7">Need a developer?</div>
          <div className="font-normal w-128">
            Check out our{' '}
            <span
              className={linkClassNames}
              onClick={handleOpenDiscordServerWindow}
            >
              Discord server
            </span>{' '}
            to find developers who are already familiar with Koii and creating
            Tasks.
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
});
