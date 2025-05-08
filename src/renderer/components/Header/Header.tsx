import React from 'react';
import { useQueryClient } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';

import CurveLine from 'assets/svgs/curve-line.svg';
import FinnieLogoVIP from 'assets/svgs/finnie-logos/finnie-logo-vip.svg';
import FinnieLogo from 'assets/svgs/finnie-logos/finnie-logo.svg';
import { useBrandLogo } from 'renderer/features/common/hooks/useBrandLogo';
import { QueryKeys } from 'renderer/services';
import { useTheme } from 'renderer/theme/ThemeContext';
import { AppRoute } from 'renderer/types/routes';

import Navbar from './Navbar';

function Header(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  const canRedirectToHome = location.pathname !== AppRoute.MyNode;

  const { theme } = useTheme();

  const queryClient = useQueryClient();
  const hasSeenNewWalletsSection = (
    queryClient.getQueryData([QueryKeys.UserSettings]) as any
  )?.hasSeenNewWalletsSection;

  const BrandLogo = useBrandLogo(FinnieLogo);

  return (
    <header className="w-full z-10 sticky flex items-center justify-between text-white h-xxl overflow-y-visible">
      <button
        onClick={() => canRedirectToHome && navigate(AppRoute.MyNode)}
        className={`relative pl-4 ${
          canRedirectToHome ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        {theme === 'vip' ? (
          <FinnieLogoVIP
            className={`w-[96px] ${
              canRedirectToHome && 'hover:text-finnieTeal'
            } transition-all duration-300 ease-in-out`}
          />
        ) : (
          <BrandLogo
            className={`h-xxl w-[71px] ${
              canRedirectToHome && 'hover:text-finnieTeal'
            } transition-all duration-300 ease-in-out`}
          />
        )}
      </button>
      <div className="relative w-full overflow-x-hidden overflow-y-visible h-full flex items-center">
        <div className="ml-auto w-fit my-auto pr-8">
          <CurveLine
            className={`absolute top-7 h-[50%] ${
              hasSeenNewWalletsSection ? '-right-[2000px]' : '-right-[1950px]'
            } ${theme === 'vip' ? 'text-[#FCBD4D]' : 'text-white'}`}
          />
          <Navbar />
        </div>
      </div>
    </header>
  );
}

export default Header;
