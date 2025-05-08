import React from 'react';
import { useRoutes } from 'react-router-dom';

import AppLoader from 'renderer/AppLoader';
import AppBoot from 'renderer/AppWrapper';
import { AppInit } from 'renderer/features/auth/components/AppInit';
import { RetrieveNodeAccess } from 'renderer/features/auth/components/RetrieveNodeAccess/RetrieveNodeAccess';
import { NotificationsCenter } from 'renderer/features/notifications/NotificationsCenter/NotificationsCenter';
import {
  BackupKeyNow,
  ConfirmSecretPhrase,
  ConfirmYourStake,
  CreateNewKey,
  CreatePin,
  FundNewKey,
  GetFreeTokens,
  ImportKey,
  ImportKeySuccess,
  KeyCreationMethodPick,
  PhraseSaveSuccess,
  RunFirstTask,
  SeeBalance,
} from 'renderer/features/onboarding';
import { InitialScreen } from 'renderer/features/onboarding/components/InitialScreen';
import { ReferralsView } from 'renderer/features/referrals/components/ReferralsView';
import { SETTINGS_SECTIONS } from 'renderer/features/settings/settingsRoutesConfig';
import { AvailableTasksTable } from 'renderer/features/tasks/components/AvailableTasksTable';
import { MyNodeTable } from 'renderer/features/tasks/components/MyNodeTable';
import { AppRoute } from 'renderer/types/routes';

import { Unlock } from '../components';

const routes = [
  { path: AppRoute.Unlock, element: <Unlock /> },
  { path: AppRoute.AppInit, element: <AppInit /> },
  { path: AppRoute.RetrieveNodeAccess, element: <RetrieveNodeAccess /> },
  {
    path: AppRoute.Root,
    element: <AppBoot />,
    children: [
      { path: AppRoute.Root, element: <AppLoader /> },
      { path: AppRoute.MyNode, element: <MyNodeTable /> },
      {
        path: AppRoute.AddTask,
        element: <AvailableTasksTable />,
      },
      {
        path: AppRoute.Rewards,
        element: (
          <div className="w-1/2 mx-auto mt-56 text-3xl text-center">
            Rewards
          </div>
        ),
      },
      {
        path: AppRoute.Notifications,
        element: <NotificationsCenter />,
      },
      {
        path: AppRoute.Referral,
        element: <ReferralsView />,
      },
      {
        path: AppRoute.Settings,
        // element: <Settings />,
        children: SETTINGS_SECTIONS.map(({ path, component: Component }) => ({
          path,
          element: <Component />, // Replace with the actual component you want to render for this route
        })),
      },

      {
        path: AppRoute.Onboarding,
        children: [
          {
            path: AppRoute.OnboardingInitialScreen,
            element: <InitialScreen />,
          },
          {
            path: AppRoute.OnboardingCreatePin,
            element: <CreatePin />,
          },
          {
            path: AppRoute.OnboardingCreateOrImportKey,

            children: [
              {
                path: AppRoute.OnboardingPickKeyCreationMethod,
                element: <KeyCreationMethodPick />,
              },
              {
                path: AppRoute.OnboardingCreateNewKey,
                element: <CreateNewKey />,
              },
              {
                path: AppRoute.OnboardingBackupKeyNow,
                element: <BackupKeyNow />,
              },
              {
                path: AppRoute.OnboardingConfirmSecretPhrase,
                element: <ConfirmSecretPhrase />,
              },
              {
                path: AppRoute.OnboardingGetFreeTokens,
                element: <GetFreeTokens />,
              },
              {
                path: AppRoute.OnboardingImportKey,
                element: <ImportKey />,
              },
              {
                path: AppRoute.OnboardingFundNewKey,
                element: <FundNewKey />,
              },
              {
                path: AppRoute.OnboardingSeeBalance,
                element: <SeeBalance />,
              },
              {
                path: AppRoute.OnboardingPhraseImportSuccess,
                element: <ImportKeySuccess />,
              },
              {
                path: AppRoute.OnboardingPhraseSaveSuccess,
                element: <PhraseSaveSuccess />,
              },
            ],
          },
          {
            path: AppRoute.OnboardingCreateFirstTask,
            element: <RunFirstTask />,
          },
          {
            path: AppRoute.OnboardingConfirmStake,
            element: <ConfirmYourStake />,
          },
        ],
      },
    ],
  },
];

const AppRoutes = () => {
  return useRoutes(routes);
};

export default AppRoutes;
