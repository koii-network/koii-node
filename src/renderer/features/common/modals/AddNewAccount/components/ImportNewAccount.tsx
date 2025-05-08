import { Icon, UploadLine, CloseLine } from '@_koii/koii-styleguide';
import React, { useCallback, useState } from 'react';

import { PinInput } from 'renderer/components/PinInput';
import { ErrorMessage, Button } from 'renderer/components/ui';
import { ModalContent } from 'renderer/features/modals';
import { useUserAppConfig } from 'renderer/features/settings/hooks';
import { Theme } from 'renderer/types/common';
import { validatePin } from 'renderer/utils';

import { Steps } from '../types';

type PropsType = Readonly<{
  setNextStep: (step: Steps) => void;
  onClose: () => void;
  setAccountPin: (pin: string) => void;
  accountPin: string;
}>;

export function ImportNewAccount({
  setNextStep,
  onClose,
  setAccountPin,
  accountPin,
}: PropsType) {
  const [error, setError] = useState<Error | string>('');
  const { userConfig: settings } = useUserAppConfig();

  const handleValidateUser = async () => {
    const isPinValid = await validatePin(accountPin, settings?.pin);

    try {
      if (isPinValid) {
        setNextStep(Steps.ImportWithKeyPhrase);
      } else {
        setError('Invalid PIN code');
      }
    } catch (error: any) {
      setError(error);
    }
  };

  const handlePinInputChange = useCallback((pin: string) => {
    setAccountPin(pin);
  }, []);

  return (
    <ModalContent theme={Theme.Dark} className="w-[700px] h-fit py-4 pb-6">
      <div className="text-white">
        <div className="flex justify-between p-3">
          <div className="flex items-center justify-between gap-6 pl-6">
            <Icon source={UploadLine} className="w-7 h-7" />
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

        <div className="px-10 mt-5">
          <p className="pl-2 mb-1.5 text-left uppercase tracking-widest">
            Enter node Access PIN
          </p>
          <div className="bg-transparent w-full px-2.5 pt-5 pb-4 flex flex-col items-start rounded-md">
            <PinInput onChange={handlePinInputChange} />
          </div>
        </div>

        <div className="flex flex-col items-center px-4">
          <ErrorMessage error={error} />
        </div>

        <div className="flex justify-center pt-2">
          <Button
            disabled={accountPin.length !== 6}
            onClick={handleValidateUser}
            label="Enter Secret Phrase"
            className="font-semibold bg-white text-finnieBlue-light w-[220px] h-[48px]"
          />
        </div>
      </div>
    </ModalContent>
  );
}
