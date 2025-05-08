import { CheckSuccessLine, Icon } from '@_koii/koii-styleguide';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from 'renderer/components/ui';
import { useFundNewAccountModal } from 'renderer/features/common';
import { AppRoute } from 'renderer/types/routes';

import { useOnboardingContext } from '../../context/onboarding-context';

function ImportKeySuccess() {
  const navigate = useNavigate();
  const { systemKey } = useOnboardingContext();

  const maskedKey = systemKey
    ? `${systemKey.substring(0, 22)}...${systemKey
        .trim()
        .substring(systemKey.length - 5)}`
    : '';

  const { showModal: showFundAccountModal } = useFundNewAccountModal();

  const handleContinue = () => {
    navigate(AppRoute.OnboardingSeeBalance);
    showFundAccountModal();
  };

  return (
    <div className="flex items-center justify-center text-center">
      <div className="flex flex-col items-center w-[348px] md2:w-[600px] gap-24">
        <div className="p-4 mb-10 rounded-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="text-finnieEmerald-light">
              <Icon source={CheckSuccessLine} className="w-12 h-12 m-3" />
            </div>
            <span className="mt-2 text-2xl">
              Your account was successfully imported!
            </span>
          </div>
          <div
            title={systemKey}
            className="text-finnieEmerald-light text-elipsis mt-10 underline"
          >
            {maskedKey}
          </div>
        </div>
        <Button
          label="Next"
          className="font-semibold bg-finnieGray-light text-finnieBlue-light w-[240px] h-[48px]"
          onClick={handleContinue}
        />
      </div>
    </div>
  );
}

export default ImportKeySuccess;
