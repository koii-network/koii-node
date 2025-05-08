import { create, useModal } from '@ebay/nice-modal-react';
import React, { useState } from 'react';
import { useQuery } from 'react-query';

import { useCloseWithEsc } from 'renderer/features/common/hooks/useCloseWithEsc';
import { Modal, ModalContent, ModalTopBar } from 'renderer/features/modals';
import { useMainAccount } from 'renderer/features/settings';
import { getActiveAccountName, QueryKeys } from 'renderer/services';
import { Theme } from 'renderer/types/common';

import { EnterNodePassword } from './components/EnterNodePassword';
import SuccessView from './components/SuccessView';
import { Steps } from './types';

type PropsType = {
  accountName?: string;
  publicKey?: string;
};

export const CreateMissingKPLStakingKey = create<PropsType>(
  function CreateMissingKPLStakingKey({ accountName, publicKey }) {
    const modal = useModal();
    const [currentStep, setCurrentStep] = useState(Steps.EnterNodePassword);

    const handleClose = () => {
      modal.remove();
    };

    const handleResolve = () => {
      modal.resolve();
      modal.remove();
    };

    const { data: activeAccountName = '' } = useQuery(
      [QueryKeys.MainAccountName],
      getActiveAccountName,
      {
        enabled: !accountName,
      }
    );

    const { data: mainAccountPubKey = '' } = useMainAccount();

    const accountNameToUse = accountName || activeAccountName;
    const publicKeyToUse = publicKey || mainAccountPubKey;

    useCloseWithEsc({ closeModal: handleClose });

    const getCurrentView = (step: Steps) => {
      const views = {
        [Steps.EnterNodePassword]: (
          <EnterNodePassword
            accountName={accountNameToUse}
            publicKey={publicKeyToUse}
            setNextStep={handleResolve}
          />
        ),
        [Steps.SuccessView]: <SuccessView onClose={handleResolve} />,
      };

      return (
        <Modal>
          <ModalContent
            theme={Theme.Dark}
            className="w-[791px] text-white pb-6"
          >
            <ModalTopBar
              theme="dark"
              title="Create KPL Staking Key"
              onClose={handleClose}
            />
            {views[step]}
          </ModalContent>
        </Modal>
      );
    };
    return getCurrentView(currentStep);
  }
);
