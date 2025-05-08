import { create, useModal } from '@ebay/nice-modal-react';
import React from 'react';

import { Modal, ModalContent } from 'renderer/features/modals';
import { GetFreeTokens } from 'renderer/features/onboarding/components/GetFreeTokens';

export interface Props {
  accountPublicKey?: string;
  onGoBack?: () => void;
}

export const AddFunds = create(function AddFunds({
  accountPublicKey = '',
  onGoBack,
}: Props) {
  const modal = useModal();

  const closeModal = () => {
    onGoBack?.();
    modal.resolve();
    modal.remove();
  };

  return (
    <Modal>
      <ModalContent className="w-[500px] h-auto text-finnieBlue bg-transparent rounded-3xl p-6 pt-4">
        <GetFreeTokens
          closeModal={closeModal}
          accountPublicKey={accountPublicKey}
        />
      </ModalContent>
    </Modal>
  );
});
