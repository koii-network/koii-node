import { Icon, KeyUnlockLine, CloseLine } from '@_koii/koii-styleguide';
import React, { memo, useState } from 'react';
import { useQueryClient } from 'react-query';

import {
  AccountsType,
  ImportFromSeedPhrase,
} from 'renderer/components/ImportFromSeedPhrase';
import { Button } from 'renderer/components/ui';
import { ModalContent } from 'renderer/features/modals';
import { Theme } from 'renderer/types/common';

import { Steps } from '../types';

type PropsType = Readonly<{
  onClose: () => void;
  onImportSuccess: (keys: AccountsType) => void;
  appPin: string;
  setNextStep: (step: Steps) => void;
}>;

function ImportWithKeyPhrase({
  onClose,
  onImportSuccess,
  appPin,
  setNextStep,
}: PropsType) {
  const queryCache = useQueryClient();

  const [accountName, setAccountName] = useState('');

  const openImportWithKeyFile = () => {
    setNextStep(Steps.ImportWithKeyFile);
  };

  return (
    <ModalContent theme={Theme.Dark} className="w-[700px] h-fit pt-4 pb-6">
      <div className="text-white ">
        <div className="flex justify-between p-3">
          <div className="flex items-center justify-between gap-6 pl-6">
            <Icon source={KeyUnlockLine} className="w-7 h-7" />
            <span className="text-[24px]">
              Import a key with a secret phrase
            </span>
          </div>
          <Icon
            source={CloseLine}
            className="w-8 h-8 cursor-pointer"
            onClick={onClose}
          />
          {/*  not sure */}
        </div>

        <div className="flex items-center justify-center w-full p-4">
          <input
            className="w-[360px] px-6 py-2 rounded-md bg-finnieBlue-light-tertiary focus:ring-2 focus:ring-finnieTeal focus:outline-none text-sm focus:bg-finnieBlue-light-secondary"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Account name"
          />
        </div>

        <ImportFromSeedPhrase
          accountName={accountName}
          onImportSuccess={({ accountName, mainAccountPubKey }) => {
            queryCache.invalidateQueries();
            onImportSuccess({ accountName, mainAccountPubKey });
          }}
          confirmActionLabel="Import Account"
          appPin={appPin}
          className="px-8 bg-finnieBlue-light-4"
        />
        <div className="flex items-center justify-center w-full px-4 pt-3">
          <Button
            onClick={openImportWithKeyFile}
            label="Import with a Key File"
            className="w-auto text-white underline"
          />
        </div>
      </div>
    </ModalContent>
  );
}

export default memo(ImportWithKeyPhrase);
