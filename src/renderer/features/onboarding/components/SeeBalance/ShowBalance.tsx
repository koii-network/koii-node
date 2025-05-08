import { CheckSuccessLine, Icon } from '@_koii/koii-styleguide';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppRoute } from 'renderer/types/routes';
import { getKoiiFromRoe } from 'utils';

type PropsType = {
  balance: number;
};

export function ShowBalance({ balance }: PropsType) {
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      navigate(AppRoute.OnboardingCreateFirstTask);
    }, 2000);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="px-[270px] mb-10">
        Success! You can now stake tokens and run tasks to earn rewards.
      </div>
      <div className="w-[78px] h-[78px] p-2 rounded-full mb-4">
        <div className="flex flex-col items-center justify-center w-full h-full gap-3 rounded-full text-finnieTeal bg-finnieBlue-light-secondary">
          <Icon source={CheckSuccessLine} className="w-10 h-10" />
        </div>
      </div>

      <p className="text-lg leading-6">{getKoiiFromRoe(balance)} KOII</p>
    </div>
  );
}
