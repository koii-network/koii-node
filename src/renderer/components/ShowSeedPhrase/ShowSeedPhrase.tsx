import { Icon, LockLine } from '@_koii/koii-styleguide';
import React, { useState } from 'react';

type PropsType = {
  seedPhrase: string;
  onPhraseReveal?: () => void;
};

export function ShowSeedPhrase({ seedPhrase = '', onPhraseReveal }: PropsType) {
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);

  const seedPhraseArray = seedPhrase
    ? seedPhrase.split(' ')
    : Array(12).fill('');

  return (
    <div className="relative">
      {!showSeedPhrase && (
        <button
          className="absolute top-0 left-0 w-full h-full backdrop-blur-sm bg-gray/30"
          onClick={() => {
            setShowSeedPhrase(true);
            onPhraseReveal?.();
          }}
        >
          <div className="flex flex-col items-center justify-center w-full h-full">
            <Icon source={LockLine} className="h-16 w-16 mb-4" />
            <p> Tap to unlock</p>
          </div>
        </button>
      )}
      <div className="flex justify-center">
        <div className="columns-2 bg-finnieBlue-light-secondary w-[360px] xl:w-[560px] rounded py-4 px-[30px] select-text transition-all duration-300 ease-in-out">
          {(seedPhraseArray ?? []).map((phrase, index) => {
            const wordNumber = index + 1;
            return (
              <div
                className="flex flex-row items-center justify-start gap-4 xl:gap-10 mb-2 select-text "
                key={index}
              >
                <div>{wordNumber}.</div>
                <div>{phrase}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
