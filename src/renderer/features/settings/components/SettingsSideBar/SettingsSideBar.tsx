import { Icon } from '@_koii/koii-styleguide';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import { InfoBox } from 'renderer/features/sidebar/components';
import { AppRoute } from 'renderer/types/routes';

import { SETTINGS_SECTIONS } from '../../settingsRoutesConfig';

const ICON_SIZE = 28;

export function SettingsSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleKeyPress = (event: React.KeyboardEvent, path: string) => {
    if (event.key === 'Enter') {
      handleNavigation(path);
    }
  };

  return (
    <div className="flex flex-col pr-[22px] gap-4 pb-4">
      {SETTINGS_SECTIONS.slice(0, -2).map(
        ({ label, icon, path, disabled, iconFocused }) => {
          const isActive = location.pathname.includes(path);
          const sidebarItemClasses = twMerge(
            'flex items-center justify-start gap-3 py-4 pl-4 cursor-pointer hover:font-bold',
            isActive && 'text-green-2 font-semibold'
          );

          const iconSize =
            path === AppRoute.SettingsAutomateNode ? 32 : ICON_SIZE;

          return (
            <InfoBox
              key={path}
              className={`w-[186px] xl:w-[230px] 2xl:w-[350px] py-4 xl:py-4 ${
                disabled ? 'hidden' : ''
              }`}
            >
              <div
                onClick={() => handleNavigation(path)}
                onKeyDown={(event) => handleKeyPress(event, path)}
                role="button"
                tabIndex={0}
                className={sidebarItemClasses}
              >
                {isActive ? (
                  <Icon source={iconFocused} size={iconSize} />
                ) : (
                  <Icon source={icon} size={iconSize} />
                )}
                <div className="text-md">{label}</div>
              </div>
            </InfoBox>
          );
        }
      )}

      <div>
        <div className="flex justify-between gap-4 w-[186px] xl:w-[230px] 2xl:w-[350px] xl1:w-[450px] xl2:w-[550px] transition-all duration-300 ease-in-out">
          {SETTINGS_SECTIONS.slice(-2).map(
            ({ icon, iconFocused, path, disabled, label }) => {
              const isActive = location.pathname.includes(path);
              const sidebarItemClasses = twMerge(
                'flex text-lg items-center justify-center p-4 cursor-pointer hover:font-semibold',
                isActive && 'text-green-2 font-semibold'
              );

              return (
                <InfoBox
                  key={path}
                  className={`w-[84px] py-1 ${disabled ? 'hidden' : ''}`}
                >
                  <div
                    key={path}
                    onClick={() => handleNavigation(path)}
                    onKeyDown={(event) => handleKeyPress(event, path)}
                    role="button"
                    tabIndex={0}
                    className={sidebarItemClasses}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {isActive ? (
                        <Icon source={iconFocused} size={ICON_SIZE} />
                      ) : (
                        <Icon source={icon} size={ICON_SIZE} />
                      )}
                      <span className="text-xs font-semibold">{label}</span>
                    </div>
                  </div>
                </InfoBox>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
