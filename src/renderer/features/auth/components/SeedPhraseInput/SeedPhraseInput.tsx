import React, { ChangeEvent, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button, ErrorMessage } from 'renderer/components';

type PropsType = {
  className?: string;
  onSeedPhraseSubmit: (seedPhraseString: string) => void;
  confirmActionLabel: string;
  actionButtonClassName?: string;
  externalError?: Error | string;
  isLoading?: boolean;
};

export function SeedPhraseInput({
  className,
  onSeedPhraseSubmit,
  confirmActionLabel,
  actionButtonClassName,
  externalError,
  isLoading,
}: PropsType) {
  const [isFormValid, setIsFormValid] = useState(false);
  const [words, setWords] = useState(new Array<string>(12).fill(''));
  const [error, setError] = useState<Error | string | undefined>();
  const [wordsErrors, setWordsErrors] = useState(
    new Array<boolean>(12).fill(false)
  );

  const handleInputChange = async (
    e: ChangeEvent<HTMLInputElement>,
    phraseIndex: number
  ) => {
    setError('');
    const { value } = e.target;
    const newWords: string[] = Object.assign([], words, {
      [phraseIndex]: value,
    });
    setWords(newWords);
    const isValidWord = await window.main.validateBip39Word({ word: value });

    const newWordsErrors = Object.assign([], wordsErrors, {
      [phraseIndex]: !isValidWord,
    });
    setWordsErrors(newWordsErrors);

    const allFieldsFilled = newWords.every((word) => word.trim() !== '');
    const allFieldsValid = newWordsErrors.every((error) => !error);
    setIsFormValid(allFieldsFilled && allFieldsValid);
  };

  const classes = twMerge(
    'columns-2 bg-finnieBlue-light-secondary w-[360px] rounded py-4 px-[30px] select-text',
    className ?? ''
  );

  const buttonClasses = twMerge(
    'font-semibold bg-white text-finnieBlue-light w-[240px] h-[48px]',
    actionButtonClassName ?? ''
  );

  return (
    <div className="relative text-white">
      <div>
        <div className="flex justify-center">
          <div className={classes}>
            {words.map((_, index) => {
              const wordNumber = index + 1;
              return (
                <div
                  className="flex flex-row items-center justify-between mb-2"
                  key={index}
                >
                  <div>{wordNumber}.</div>
                  <input
                    className={`w-[120px] p-1 rounded-md bg-transparent focus:ring-1 focus:ring-finnieTeal focus:outline-none text-sm focus:bg-finnieBlue-light-secondary ${
                      wordsErrors[index] && '!ring-1 !ring-finnieRed'
                    }`}
                    onChange={(e) => handleInputChange(e, index)}
                    value={words[index]}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-6">
        <div className="h-12 -mt-4">
          {error && <ErrorMessage error={error} />}
          {externalError && <ErrorMessage error={externalError} />}
        </div>
        <Button
          onClick={async () => onSeedPhraseSubmit(words.join(' '))}
          label={confirmActionLabel}
          className={buttonClasses}
          disabled={!isFormValid}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
