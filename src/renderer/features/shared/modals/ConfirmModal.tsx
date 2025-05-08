import { Icon, CloseLine, BrowseInternetLine } from '@_koii/koii-styleguide';
import { create, useModal } from '@ebay/nice-modal-react';
import React from 'react';

import { Button } from 'renderer/components/ui';
import { useCloseWithEsc } from 'renderer/features/common/hooks/useCloseWithEsc';
import { Modal, ModalContent } from 'renderer/features/modals';

export interface Props {
  header: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export const ConfirmModal = create<Props>(function ConfirmModal({
  header,
  content,
  icon,
}) {
  const modal = useModal();

  const handleClose = () => {
    modal.resolve(false);
    modal.remove();
  };

  const handleConfirm = async () => {
    modal.resolve(true);
    modal.remove();
  };

  useCloseWithEsc({ closeModal: handleClose });

  return (
    <Modal>
      <ModalContent className="p-5 pl-10 w-fit h-fit text-white bg-finnieBlue-light-secondary rounded flex flex-col gap-4 max-w-[790px]">
        <div className="flex items-center justify-center w-full gap-4 pt-2 text-2xl font-semibold">
          {icon ?? <Icon source={BrowseInternetLine} className="w-8 h-8" />}
          {header}
          <Icon
            source={CloseLine}
            className="w-8 h-8 ml-auto -mt-6 cursor-pointer"
            onClick={handleClose}
          />
        </div>

        <div className="p-4 pb-8 pl-0 leading-loose text-left">{content}</div>

        <div className="flex items-center justify-center gap-8 mx-auto w-fit">
          <Button
            label="Go Back"
            onClick={handleClose}
            className="w-56 h-12 m-auto font-semibold text-white bg-transparent border-2 border-white"
          />
          <Button
            label="Confirm"
            onClick={handleConfirm}
            className="w-56 h-12 m-auto font-semibold bg-white text-finnieBlue-light"
          />
        </div>
      </ModalContent>
    </Modal>
  );
});
