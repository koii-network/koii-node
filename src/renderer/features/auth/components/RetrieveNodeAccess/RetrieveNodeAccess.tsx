import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

import WelcomeLinesDiagonal from 'assets/svgs/welcome-lines-diagonal.svg';
import WelcomeWheelBackground from 'assets/svgs/welcome-wheel-background.svg';
import { AppRoute } from 'renderer/types/routes';

import { SeedPhraseInput } from '../SeedPhraseInput/SeedPhraseInput';

export function RetrieveNodeAccess() {
  const navigate = useNavigate();

  const resetPinMutation = async (seedPhrase: string) => {
    const seedPhraseMatchesOneOfTheAccounts = await window.main.resetPin({
      seedPhraseString: seedPhrase,
    });
    if (!seedPhraseMatchesOneOfTheAccounts) {
      throw new Error('Seed phrase does not match any of the accounts');
    }
  };

  const {
    mutate: resetPin,
    isLoading,
    isError,
    error,
  } = useMutation(resetPinMutation, {
    onSuccess: () => {
      navigate(AppRoute.MyNode, { state: { noBackButton: true } });
    },
  });

  const handleSeedPhraseSubmit = (seedPhrase: string) => {
    resetPin(seedPhrase);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden bg-main-gradient">
      <WelcomeWheelBackground className="absolute top-0 -left-[40%] h-[40%] scale-110 text-finnieTeal-100" />

      <div className="z-50 flex flex-col items-center">
        <div>
          <h1 className="pb-4 text-4xl font-semibold text-white">
            Retrieve Node Access
          </h1>
          <p className="pb-6 text-lg text-white">
            Enter your seed phrase to retrieve access to your node
          </p>
        </div>
        <SeedPhraseInput
          confirmActionLabel="Retrieve Node Access"
          onSeedPhraseSubmit={handleSeedPhraseSubmit}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          externalError={isError ? (error as any).message : undefined}
          isLoading={isLoading}
        />

        <button
          onClick={() => navigate(AppRoute.Unlock)}
          className="mt-8 text-white underline"
          disabled={isLoading}
        >
          Unlock with PIN
        </button>
      </div>
      <WelcomeLinesDiagonal className="absolute bottom-0 -right-[22.5%] h-full" />
    </div>
  );
}
