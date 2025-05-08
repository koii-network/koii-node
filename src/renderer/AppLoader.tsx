import React from 'react';
import { Navigate } from 'react-router-dom';

import { LoadingSpinner } from 'renderer/components';
import { AppRoute } from 'renderer/types/routes';

import { useUserAppConfig } from './features/settings/hooks';

function AppLoader(): JSX.Element {
  const { userConfig: settings, isUserConfigLoading: loadingSettings } =
    useUserAppConfig();

  const routeToNavigate = settings?.onboardingCompleted
    ? AppRoute.AppInit
    : AppRoute.OnboardingInitialScreen;

  if (loadingSettings) return <LoadingSpinner className="m-auto" />;

  return <Navigate to={routeToNavigate} />;
}

export default AppLoader;
