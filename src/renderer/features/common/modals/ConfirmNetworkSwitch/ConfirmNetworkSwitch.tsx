import { BrowseInternetLine, CloseLine, Icon } from '@_koii/koii-styleguide';
import { create, useModal } from '@ebay/nice-modal-react';
import React from 'react';

import { Button } from 'renderer/components/ui';
import { useCloseWithEsc } from 'renderer/features/common/hooks/useCloseWithEsc';
import { Modal, ModalContent } from 'renderer/features/modals';

export interface Props {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  newNetwork: string;
}

export const ConfirmNetworkSwitch = create<Props>(
  function ConfirmNetworkSwitch({ onConfirm, onCancel, newNetwork }) {
    const modal = useModal();

    const handleClose = () => {
      onCancel();
      modal.resolve();
      modal.remove();
    };

    const handleConfirm = async () => {
      await onConfirm();
      modal.resolve(true);
      modal.remove();
    };

    useCloseWithEsc({ closeModal: handleClose });

    return (
      <Modal>
        <ModalContent className="p-5 pl-10 w-fit h-fit text-white bg-finnieBlue-light-secondary rounded flex flex-col gap-4 max-w-[790px]">
          <div className="w-full flex justify-center items-center text-2xl gap-4 font-semibold pt-2">
            <Icon source={BrowseInternetLine} className="h-8 w-8" />
            <span>Restart to Change Networks</span>
            <Icon
              source={CloseLine}
              className="h-8 w-8 ml-auto cursor-pointer -mt-6"
              onClick={handleClose}
            />
          </div>

          <div className="p-4 pl-0 pb-8 text-left leading-loose">
            The node will restart when you switch networks. Are you sure you
            want to change to {newNetwork}? Make sure you pause your active
            tasks since you could lose your stake.
          </div>

          <div className="w-fit mx-auto flex items-center justify-center gap-8">
            <Button
              label="Go Back"
              onClick={handleClose}
              className="border-2 border-white bg-transparent text-white w-56 h-12 m-auto font-semibold"
            />
            <Button
              label="Restart"
              onClick={handleConfirm}
              className="bg-white text-finnieBlue-light w-56 h-12 m-auto font-semibold"
            />
          </div>
        </ModalContent>
      </Modal>
    );
  }
);
