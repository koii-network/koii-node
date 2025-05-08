import { Button } from '@_koii/koii-styleguide';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import BackgroundBall from 'assets/svgs/bg-ball.svg';
import BackgroundDots from 'assets/svgs/bg-dots.svg';
import BackgroundWaves from 'assets/svgs/bg-waves.svg';
import KoiiLogo from 'assets/svgs/finnie-logos/finnie-logo.svg';
import { useBrandLogo } from 'renderer/features/common/hooks/useBrandLogo';
import { AppRoute } from 'renderer/types/routes';

import { onboardingSteps } from '../OnboardingLayout/OnboardingLayout';

function InitialScreen() {
  const navigate = useNavigate();

  const startOnboarding = () => navigate(AppRoute.OnboardingCreatePin);

  const BrandLogo = useBrandLogo(KoiiLogo);

  return (
    <div className="relative bg-main-gradient w-full h-full overflow-hidden">
      <div className="relative z-10 w-full h-full m-auto flex flex-col items-center justify-center gap-[4vh] md2h:gap-[6vh]">
        <BrandLogo className="w-14 h-14 text-white" />
        <div className="w-fit text-center font-semibold text-2xl">
          <span className="text-white">Get started in just </span>
          <span className="text-finniePurple">three simple steps.</span>
        </div>

        <div className="flex gap-10 my-10">
          {onboardingSteps.map(({ label, Icon }) => (
            <StepBox key={label} label={label} Icon={Icon} />
          ))}
        </div>
        <Button
          onClick={startOnboarding}
          label="Start now!"
          labelClassesOverrides="font-semibold"
          buttonClassesOverrides="w-[182px] flex items-center justify-between"
          iconRight={<ChevronRightIcon className="text-finnieBlue w-4 h-4" />}
        />
      </div>
      <BackgroundBall className="absolute top-0 -left-14 w-[600px] h-[600px]" />
      <BackgroundWaves className="absolute bottom-0 -right-14 w-[750px] h-[750px]" />
      <BackgroundDots className="absolute w-[90vw] h-[90vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}

export default InitialScreen;

interface StepBoxProps {
  label: string;
  Icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
}

function StepBox({ label, Icon }: StepBoxProps) {
  return (
    <div className="flex flex-col justify-evenly text-center w-[192px] h-[172px] px-5 bg-finnieBlue-light-secondary/[0.5] rounded-lg">
      <Icon className="w-10 h-10 mx-auto text-white" />
      <span className="text-white">{label}</span>
    </div>
  );
}
