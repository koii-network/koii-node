import {
  ChevronArrowLine,
  ClickXlLine,
  CurrencyMoneyLine,
  Icon,
  LockLine,
} from '@_koii/koii-styleguide';
import React, { useEffect, useMemo, useState } from 'react';

import { Button } from 'renderer/components';
import { useBrandLogo } from 'renderer/features/common/hooks/useBrandLogo';
import { useAppNotifications } from 'renderer/features/notifications/hooks';
import { useMainAccount, useUserAppConfig } from 'renderer/features/settings';
import { initializeTasks } from 'renderer/services';
import { AppRoute } from 'renderer/types/routes';

import { useOnboardingContext } from '../../context/onboarding-context';
import { useBackButtonHandler } from '../../hooks/useBackButtonHandler';
import { ProgressBar } from '../ProgressBar';

type PropsType = {
  children: React.ReactNode;
};

export const onboardingSteps = [
  {
    label: 'Secure your Node with a PIN.',
    Icon: LockLine,
    routes: [AppRoute.OnboardingCreatePin],
  },
  {
    label: 'Fund your new key or import one.',
    Icon: CurrencyMoneyLine,
    routes: [
      AppRoute.OnboardingCreateOrImportKey,
      AppRoute.OnboardingCreateNewKey,
      AppRoute.OnboardingPickKeyCreationMethod,
      AppRoute.OnboardingImportKey,
      AppRoute.OnboardingBackupKeyNow,
      AppRoute.OnboardingConfirmSecretPhrase,
      AppRoute.OnboardingPhraseImportSuccess,
      AppRoute.OnboardingPhraseSaveSuccess,
      AppRoute.OnboardingGetFreeTokens,
      AppRoute.OnboardingFundNewKey,
      AppRoute.OnboardingSeeBalance,
    ],
  },
  {
    label: 'Confirm your task and go!',
    Icon: ClickXlLine,
    routes: [
      AppRoute.OnboardingCreateFirstTask,
      AppRoute.OnboardingConfirmStake,
    ],
  },
];

function OnboardingLayout({ children }: PropsType) {
  const { isAttemptingToRunFirstTask } = useOnboardingContext();
  const {
    handleBackButtonClick,
    showOnboardingBackButton,
    currentPath,
    navigate,
  } = useBackButtonHandler();
  const { addAppNotification: showReferralProgramNotification } =
    useAppNotifications('REFERRAL_PROGRAM');
  const { data: mainAccountPubKey } = useMainAccount();

  const displaySkipButton = useMemo(
    () =>
      currentPath !== AppRoute.OnboardingCreatePin &&
      mainAccountPubKey &&
      !isAttemptingToRunFirstTask,
    [currentPath, mainAccountPubKey, isAttemptingToRunFirstTask]
  );

  const { handleSaveUserAppConfig } = useUserAppConfig({
    onConfigSaveSuccess: () => {
      navigate(AppRoute.MyNode, { state: { noBackButton: true } });
      showReferralProgramNotification();
    },
  });

  const handleSkipOnboarding = () => {
    try {
      initializeTasks();
    } catch (e) {
      console.error('Failed to initialize node', e);
    }
    handleSaveUserAppConfig({ settings: { onboardingCompleted: true } });
  };

  const isInitialScreen = currentPath === AppRoute.OnboardingInitialScreen;
  const stepTitle = useMemo(
    () =>
      onboardingSteps.find(({ routes }) => routes.includes(currentPath))?.label,
    [currentPath]
  );
  const StepIcon = useMemo(
    () =>
      onboardingSteps.find(({ routes }) => routes.includes(currentPath))?.Icon,
    [currentPath]
  );

  const [currentStepNumber, setCurrentStepNumber] = useState(0);

  // by using a state + useEffect, we can easily give ProgressBar an initial animation from 0 to 1st step
  useEffect(() => {
    const stepNumber =
      onboardingSteps.findIndex(({ routes }) => routes.includes(currentPath)) +
      1;
    setCurrentStepNumber(stepNumber);
  }, [currentPath]);

  const BrandLogo = useBrandLogo();

  return isInitialScreen ? (
    <div className="w-full h-full">{children}</div>
  ) : (
    <div className="flex flex-col h-full w-full text-white bg-main-gradient">
      <div className="w-full justify-between flex h-fit p-8">
        <div className="w-9 h-9">
          {/* {showOnboardingBackButton && ( */}
          <Icon
            source={ChevronArrowLine}
            className="-rotate-90 cursor-pointer w-9 h-9"
            onClick={handleBackButtonClick}
          />
          {/* )} */}
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="md2h:my-4">
            <ProgressBar
              currentStepNumber={currentStepNumber}
              totalNumberOfSteps={3}
            />
          </div>
          {StepIcon && (
            <StepIcon className="w-6 h-6 text-white mt-6 mb-1 md2h:mt-8 md2h:mb-3" />
          )}
          <span className="text-white text-xl font-semibold">{stepTitle}</span>
        </div>
        <Icon source={BrandLogo} className="w-11 h-11" />
      </div>

      <div className="h-full w-3/4 max-w-[1200px] flex items-center justify-center mx-auto transition-all duration-300 ease-in-out">
        {children}
      </div>
      <div className="flex flex-col min-h-[50px]">
        {displaySkipButton && (
          <Button
            label="Skip Onboarding"
            className="underline bg-transparent w-fit mx-auto "
            onClick={handleSkipOnboarding}
          />
        )}
      </div>
    </div>
  );
}

export default OnboardingLayout;
