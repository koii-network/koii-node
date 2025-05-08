import { Icon, WarningCircleLine } from '@_koii/koii-styleguide';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ShowSeedPhrase } from 'renderer/components/ShowSeedPhrase';
import { Button } from 'renderer/components/ui/Button';
import { useFundNewAccountModal } from 'renderer/features/common';
import { AppRoute } from 'renderer/types/routes';

import { useOnboardingContext } from '../../context/onboarding-context';

export function BackupKeyNow() {
  const { newSeedPhrase } = useOnboardingContext();
  const navigate = useNavigate();
  const [phraseRevealed, setPhraseRevealed] = useState(false);
  const handlePhraseReveal = () => {
    setPhraseRevealed(true);
  };

  const { showModal } = useFundNewAccountModal();

  const handleSkip = () => {
    showModal().then(() => {
      navigate(AppRoute.OnboardingGetFreeTokens);
    });
  };

  const handleConfirmClick = () => {
    const skipThisStep = !phraseRevealed;

    if (skipThisStep) {
      handleSkip();
    } else {
      navigate(AppRoute.OnboardingConfirmSecretPhrase);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 md2h:gap-7 text-center px-44 text-sm md2h:text-base 2xl:text-base transition-all duration-300 ease-in-out">
      <div className="w-full mb-4 text-2xl md2h:text-3xl 2xl:text-3xl font-semibold">
        Back up your Secret Phrase
      </div>
      <div className="w-full mb-4">
        This secret phrase gives you access to your key and allows you to import
        it on any device. Make sure to keep your secret phrase in a safe spot.
      </div>

      <div className="w-full mb-4 ">
        Keep this phrase off any internet-connected devices and never share it
        with anyone!
      </div>

      <div className="mb-4">
        <ShowSeedPhrase
          seedPhrase={newSeedPhrase as string}
          onPhraseReveal={handlePhraseReveal}
        />
      </div>

      <div className="flex flex-row items-start justify-center w-[360px] xl:w-[560px] gap-2.5 mb-4 text-sm text-[#FFA54B]">
        <Icon source={WarningCircleLine} className="h-6 w-6 mt-1" />
        <div className="text-xs text-left font-light w-fit">
          Keep this phrase off any internet-connected devices and never share it
          with anyone! Write down your secret phrase on a piece of paper and put
          it in a safe location.
        </div>
      </div>

      <Button
        label={phraseRevealed ? "I'm ready" : 'Skip this step'}
        className="font-semibold bg-finnieGray-light text-finnieBlue-light w-[240px] h-[48px]"
        onClick={handleConfirmClick}
      />
    </div>
  );
}
