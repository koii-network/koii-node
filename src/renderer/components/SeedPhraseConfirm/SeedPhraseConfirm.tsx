import React, { useEffect, useMemo, useState } from 'react';

import { ErrorMessage } from 'renderer/components/ui';

import { pickRandomNumbers } from './pickRandomNumbers';

type PropsType = {
  onPhraseChange: (phrase: string) => void;
  seedPhraseValue?: string;
  error?: string;
};

export function SeedPhraseConfirm({
  onPhraseChange,
  seedPhraseValue,
  error,
}: PropsType) {
  const [phrases, setPhrases] = useState<string[]>(new Array(12).fill(''));
  const numbers = useMemo(() => pickRandomNumbers(3), []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    phraseIndex: number
  ) => {
    const { value } = e.target;
    const newPhrases = Object.assign([], phrases, {
      [phraseIndex]: value,
    });
    setPhrases(newPhrases);
    onPhraseChange?.(newPhrases.join(' '));
  };

  const seedPhraseValueArray = useMemo(
    () => seedPhraseValue && seedPhraseValue.split(' '),
    [seedPhraseValue]
  );

  useEffect(() => {
    if (seedPhraseValue) {
      setPhrases(
        (seedPhraseValueArray || []).map((phrase, index) =>
          numbers.includes(index) ? '' : phrase
        )
      );
    }
  }, [numbers, seedPhraseValue, seedPhraseValueArray]);

  return (
    <div className="flex flex-col text-sm md2h:text-base 2xl:text-base">
      <div className="columns-2 bg-finnieBlue-light-secondary w-[360px] xl:w-[560px] rounded py-4 px-[30px] select-text mb-4 transition-all duration-300 ease-in-out">
        {phrases.map((phrase, index) => {
          const maskWord = numbers.includes(index);
          const wordNumber = index + 1;

          return maskWord ? (
            <div
              className="flex flex-row items-center justify-between mb-2 gap-4 xl:gap-10"
              key={index}
            >
              <div>{wordNumber}.</div>
              <input
                className="w-[120px] gap-2 bg-transparent border-b border-transparent focus:border-b empty:border-b empty:border-white focus:border-white focus:outline-none"
                onChange={(e) => handleInputChange(e, index)}
                value={phrases[index]}
              />
            </div>
          ) : (
            <div
              className="flex flex-row items-center justify-start gap-4 xl:gap-10 mb-2 select-text"
              key={index}
            >
              <div>{wordNumber}.</div>
              <div>{phrase}</div>
            </div>
          );
        })}
      </div>
      <div className="h-12 -mb-6 mt-6">
        {error && <ErrorMessage error={error} />}
      </div>
    </div>
  );
}
