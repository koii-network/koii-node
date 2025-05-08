import { Icon } from '@_koii/koii-styleguide';
import { faWifi3 } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import WelcomeLinesDiagonal from 'assets/svgs/welcome-lines-diagonal.svg';
import WelcomeWheelBackground from 'assets/svgs/welcome-wheel-background.svg';
import { useBrandLogo } from 'renderer/features/common/hooks/useBrandLogo';
import { useInternetConnectionStatus } from 'renderer/features/settings/hooks/useInternetConnectionStatus';
import { useTheme } from 'renderer/theme/ThemeContext';

type PropsType = {
  initError?: string;
};

const facts = [
  {
    bold: 'Koii nodes power better apps.',
    normal:
      ' Earn tokens by providing the resources you already have to your community.',
  },
  {
    bold: 'KOII is a Layer 1 currency, like Ethereum and Solana.',
    normal:
      ' Explore the wide range of possibilities and Layer 2 tokens with our application.',
  },
  {
    bold: 'Koii Network was founded in 2020,',
    normal:
      ' and it is the only live fork of Solana and one of the original projects in the Cryptocurrency space.',
  },
  {
    bold: 'Koii has more than 11 thousand users as of today,',
    normal: ' thanks for being an early adopter!',
  },
  {
    bold: 'Did you know that KOII stands for Knowledgeable, Open and Infinite Internet?',
    normal: '',
  },
  {
    bold: 'Koii has launched its Mainnet on Q1 2025.',
    normal: '',
  },
  {
    bold: 'ROE, which means a "fish egg" is the smallest unit of KOII,',
    normal: ' being equivalent to (1/1000000000) of a KOII.',
  },
  {
    bold: 'You can apply for development grants on our website.',
    normal: ' Help to build a more decentralized world!',
  },
];

const randomFact = facts[Math.floor(Math.random() * facts.length)];

export function LoadingScreen({ initError }: PropsType): JSX.Element {
  const isOnline = useInternetConnectionStatus();

  const { theme } = useTheme();
  const isVip = theme === 'vip';

  const getContent = () => {
    if (initError) {
      return (
        <p className="text-lg text-center text-finnieRed">
          <span>
            Something went wrong.
            <br /> Please restart the Koii Node
          </span>
        </p>
      );
    }

    if (!isOnline) {
      return (
        <p className="text-lg text-center text-finnieRed">
          <FontAwesomeIcon icon={faWifi3} className="pr-2" />
          <span>
            No internet connection.
            <br /> Please check your connection or restart the Koii Node
          </span>
        </p>
      );
    }

    return (
      <div
        className={twMerge(
          'w-[226px] h-2 rounded-full z-10',
          isVip ? 'bg-[#FFC78F]/40' : 'bg-[#5ED9D1]/40'
        )}
      >
        <div
          className={twMerge(
            'w-full h-full rounded-full progress-bar',
            isVip ? 'bg-[#FFC78F]/90' : 'bg-[#5ED9D1]/90'
          )}
        />
      </div>
    );
  };

  const BrandLogo = useBrandLogo();

  return (
    <div
      className={twMerge(
        'relative flex flex-col items-center justify-center h-full gap-5 overflow-hidden overflow-y-auto text-white',
        isVip
          ? 'bg-[url(assets/svgs/vip-pattern.svg)] bg-top before:absolute before:inset-0 before:bg-gradient-to-b before:from-[#383838]/70 before:via-black before:to-black before:pointer-events-none before:z-0'
          : 'bg-main-gradient'
      )}
    >
      <WelcomeWheelBackground className="absolute top-0 -left-[40%] h-[40%] scale-110 text-finnieTeal-100 z-10" />

      <Icon source={BrandLogo} className="h-[156px] w-[156px] relative z-10" />
      <h1 className="text-[40px] leading-[48px] text-center font-semibold relative z-10">
        Welcome to the New Internet.
      </h1>
      <h2 className="text-lg text-center font-semibold relative z-10">
        The World&apos;s Biggest Supercomputer—Powered by People
      </h2>
      <p className="justify-center max-w-xl text-center relative z-10">
        <span className="mr-1 text-finnieTeal">
          <span className="font-semibold">{randomFact.bold}</span>
          {randomFact.normal}
        </span>
      </p>

      <WelcomeLinesDiagonal className="absolute bottom-0 -right-[22.5%] h-full z-10" />

      {getContent()}
    </div>
  );
}
