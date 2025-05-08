import {
  CheckSuccessLine,
  Icon,
  WarningTalkLine,
} from '@_koii/koii-styleguide';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from 'renderer/components/ui/Button';
import { AppRoute } from 'renderer/types/routes';

export function PhraseSaveSuccess() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate(AppRoute.OnboardingGetFreeTokens);
  };

  return (
    <div className="text-center flex flex-col gap-[4vh]">
      <h1 className="flex flex-col items-center justify-center gap-4 text-2xl md2h:text-3xl 2xl:text-3xl font-semibold max-w-[284px] xl:max-w-none mx-auto">
        <div className="text-finnieEmerald-light">
          <Icon source={CheckSuccessLine} className="w-12 h-12 m-3" />
        </div>
        You successfully saved your secret phrase
      </h1>
      <div className="mb-12 mx-auto font-light">
        <p className="mb-6 font-normal">Never share your secret phrase.</p>
        If you ever need this account on another device, use your <br /> secret
        phrase to connect it. You shouldn’t enter your
        <br /> phrase for any other reason.
      </div>
      <div className="flex items-center gap-4 text-[#FFA54B] text-[11px] text-left font-light mx-auto w-fit">
        <Icon source={WarningTalkLine} className="w-6 h-6" />
        This secret phrase grants access to all your tokens and rewards.
        <br /> No one from Koii will ever ask you for your secret phrase.
      </div>

      <Button
        onClick={handleContinue}
        label="Next"
        className="font-semibold bg-finnieGray-light text-finnieBlue-light w-[220px] h-[38px] mx-auto"
      />
    </div>
  );
}
