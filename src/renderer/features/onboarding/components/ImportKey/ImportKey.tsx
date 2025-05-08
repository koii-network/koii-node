/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  AccountsType,
  ImportFromSeedPhrase,
} from 'renderer/components/ImportFromSeedPhrase';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { Theme } from 'renderer/types/common';
import { AppRoute } from 'renderer/types/routes';

import { useOnboardingContext } from '../../context/onboarding-context';

type LocationStateType = {
  accountName: string;
};

function ImportKey() {
  const navigate = useNavigate();
  const { setSystemKey, appPin } = useOnboardingContext();
  const location = useLocation();
  const { accountName } = location.state as LocationStateType;

  const handleImportSuccess = ({ mainAccountPubKey }: AccountsType) => {
    setSystemKey(mainAccountPubKey);
    navigate(AppRoute.OnboardingPhraseImportSuccess);
  };

  return (
    <div className="flex flex-col items-center gap-[2vh] md2h:gap-[6vh] transition-all duration-300 ease-in-out">
      <div className="mb-10 text-lg">
        <span>Type in your</span>{' '}
        <Popover
          theme={Theme.Dark}
          tooltipContent={
            <>
              <span>Sometimes known as a "seed phrase"</span>{' '}
              <span>or a "recovery phrase"</span>
            </>
          }
        >
          <span className="underline cursor-pointer underline-offset-4">
            secret phrase
          </span>
        </Popover>
        <span> to import your key.</span>
      </div>
      <ImportFromSeedPhrase
        accountName={accountName}
        setImportedWalletAsDefault
        onImportSuccess={handleImportSuccess}
        confirmActionLabel="Confirm"
        appPin={appPin}
      />
    </div>
  );
}

export default ImportKey;
