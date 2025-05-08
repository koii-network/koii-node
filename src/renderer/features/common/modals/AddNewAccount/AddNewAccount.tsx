import { create, useModal } from '@ebay/nice-modal-react';
import React, { useState } from 'react';

import { useCloseWithEsc } from 'renderer/features/common/hooks/useCloseWithEsc';
import { Modal } from 'renderer/features/modals';

import { AccountCreatedOrImported } from './components/AccountCreatedOrImported';
import { CreateNewAccount } from './components/CreateNewAccount';
import ImportKey from './components/ImportAccount';
import { ImportNewAccount } from './components/ImportNewAccount';
import ImportWithKeyFile from './components/ImportWithKeyFile';
import ImportWithKeyPhrase from './components/ImportWithKeyPhrase';
import ShowSeedPhrase from './components/ShowSeedPhrase';
import { CreateKeyPayload, KeyType, Steps } from './types';

interface Props {
  pickCreateByDefault?: boolean;
}

export const AddNewAccount = create(function AddNewAccount({
  pickCreateByDefault,
}: Props) {
  const modal = useModal();
  const initialStep = pickCreateByDefault
    ? Steps.CreateNewKey
    : Steps.ImportKey;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [newKey, setNewKey] = useState<KeyType>();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [appPin, setAppPin] = useState<string>('');

  const handleCreatedNewKeyStep = (step: Steps, payload: CreateKeyPayload) => {
    setNewKey(payload.keys);
    setSeedPhrase(payload.seedPhrase);
    setCurrentStep(step);
  };

  const handleClose = () => {
    // const hasCreatedOrImported = [
    //   Steps.KeyCreated,
    //   Steps.ShowSeedPhrase,
    //   Steps.AccountImported,
    // ].includes(currentStep);
    // if (hasCreatedOrImported) modal.resolve();
    modal.resolve(newKey?.system);
    modal.remove();
  };

  useCloseWithEsc({ closeModal: handleClose });

  const getCurrentView = (step: Steps) => {
    const views = {
      [Steps.ImportKey]: (
        <ImportKey onClose={handleClose} setNextStep={setCurrentStep} />
      ),
      [Steps.ImportWithKeyPhrase]: (
        <ImportWithKeyPhrase
          onClose={handleClose}
          appPin={appPin}
          setNextStep={setCurrentStep}
          onImportSuccess={({ accountName, mainAccountPubKey }) => {
            setNewKey({
              accountName,
              system: mainAccountPubKey,
            });
            setCurrentStep(Steps.AccountImported);
          }}
        />
      ),
      [Steps.CreateNewKey]: (
        <CreateNewAccount
          onClose={handleClose}
          setNextStep={handleCreatedNewKeyStep}
        />
      ),
      [Steps.KeyCreated]: (
        <AccountCreatedOrImported
          onClose={handleClose}
          newKey={newKey as KeyType}
          title="Your Account was successfully created!"
        />
      ),
      [Steps.AccountImported]: (
        <AccountCreatedOrImported
          onClose={handleClose}
          newKey={newKey as KeyType}
          title="Your Account was successfully imported!"
        />
      ),
      [Steps.ShowSeedPhrase]: (
        <ShowSeedPhrase
          onClose={handleClose}
          setNextStep={setCurrentStep}
          seedPhrase={seedPhrase}
        />
      ),
      [Steps.ImportNewAccount]: (
        <ImportNewAccount
          onClose={handleClose}
          setNextStep={setCurrentStep}
          accountPin={appPin}
          setAccountPin={setAppPin}
        />
      ),
      [Steps.ImportWithKeyFile]: (
        <ImportWithKeyFile
          onClose={handleClose}
          onImportSuccess={({ accountName, mainAccountPubKey }) => {
            setNewKey({
              accountName,
              system: mainAccountPubKey,
            });
            setCurrentStep(Steps.AccountImported);
          }}
        />
      ),
    };

    return <Modal>{views[step]}</Modal>;
  };

  return getCurrentView(currentStep);
});
