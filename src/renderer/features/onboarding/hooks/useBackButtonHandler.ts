import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AppRoute } from 'renderer/types/routes';

const viewsWithBackButton = [
  AppRoute.OnboardingSeeBalance,
  AppRoute.OnboardingBackupKeyNow,
  AppRoute.OnboardingConfirmSecretPhrase,
  AppRoute.OnboardingImportKey,
  AppRoute.OnboardingConfirmStake,
];

const sholdDisplayBackButton = (pathname: string) => {
  if (viewsWithBackButton.includes(pathname as AppRoute)) {
    return true;
  }
};

export const useBackButtonHandler = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const showOnboardingBackButton = useMemo(
    () => sholdDisplayBackButton(pathname),
    [pathname]
  );

  const handleBackButtonClick = () => {
    if (pathname === AppRoute.OnboardingBackupKeyNow) {
      navigate(AppRoute.OnboardingCreateNewKey);
      return;
    }

    navigate(-1);
  };

  return {
    handleBackButtonClick,
    showOnboardingBackButton,
    currentPath: pathname,
    navigate,
  };
};
