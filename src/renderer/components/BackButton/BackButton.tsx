import { ChevronArrowLine, Icon } from '@_koii/koii-styleguide';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import BackIconVIP from 'assets/svgs/back-vip.svg';
import { Button } from 'renderer/components/ui/Button';
import { getRouteViewLabel } from 'renderer/routing/utils';
import { useTheme } from 'renderer/theme/ThemeContext';
import { AppRoute } from 'renderer/types/routes';

type RouterState = {
  noBackButton?: boolean;
};

type PropsType = {
  color?: 'white' | 'blue';
};

export function BackButton({ color }: PropsType) {
  const location = useLocation();

  const navigate = useNavigate();
  const routeLabel = getRouteViewLabel(location.pathname as AppRoute);

  const noBackButton = (location?.state as RouterState)?.noBackButton;

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const { theme } = useTheme();
  const isVip = !!(theme === 'vip');

  const labelClasses = twMerge(
    'text-white self-center uppercase h-10 text-3xl pr-2 align-middle pl-4 flex flex-col justify-center w-max',
    color === 'blue' && 'text-blue-1',
    isVip && 'vip-drop-shadow'
  );

  const wrapperClasses = twMerge(
    'flex items-center py-5 text-white',
    color === 'blue' && 'text-blue-1'
  );

  return (
    <div className={wrapperClasses}>
      {location.pathname === AppRoute.Root || noBackButton ? null : (
        <Button
          onlyIcon
          icon={
            <Icon
              source={isVip ? BackIconVIP : ChevronArrowLine}
              className={`cursor-pointer ${
                isVip ? ' w-16 h-16 -m-3.5' : ' w-9 h-9 -rotate-90 '
              }`}
            />
          }
          onClick={handleBackButtonClick}
        />
      )}

      <div className={labelClasses}>{routeLabel}</div>
    </div>
  );
}
