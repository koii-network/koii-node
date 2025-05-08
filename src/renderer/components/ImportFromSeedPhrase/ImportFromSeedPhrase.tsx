import { encrypt } from '@metamask/browser-passworder';
import React, { ChangeEvent, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button, ErrorMessage, LoadingSpinner } from 'renderer/components/ui';
import { createNodeWallets, setActiveAccount } from 'renderer/services';

export interface AccountsType {
  accountName: string;
  mainAccountPubKey: string;
}

type PropsType = {
  accountName: string;
  confirmActionLabel: string;
  onImportSuccess: (accounts: AccountsType) => void;
  onImportFail?: (error: string) => void;
  setImportedWalletAsDefault?: boolean;
  className?: string;
  appPin: string;
};

function ImportFromSeedPhrase({
  accountName,
  onImportSuccess,
  onImportFail,
  confirmActionLabel,
  setImportedWalletAsDefault = false,
  className,
  appPin,
}: PropsType) {
  const [words, setWords] = useState(new Array<string>(12).fill(''));
  const [wordsErrors, setWordsErrors] = useState(
    new Array<boolean>(12).fill(false)
  );
  const [error, setError] = useState<Error | string>('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = async (
    e: ChangeEvent<HTMLInputElement>,
    phraseIndex: number
  ) => {
    setError('');
    const { value } = e.target;
    const newWords = Object.assign([], words, {
      [phraseIndex]: value,
    });
    setWords(newWords);
    const isValidWord = await window.main.validateBip39Word({ word: value });

    const newWordsErrors = Object.assign([], wordsErrors, {
      [phraseIndex]: !isValidWord,
    });
    setWordsErrors(newWordsErrors);
  };

  const validateKeyPhrase = (words: string[]) => {
    const isNotEmpty = (item: string) => item !== '';
    const allWordsAreProvided = words.every(isNotEmpty);
    const allWordsAreValid = !wordsErrors.includes(true);
    const error = !allWordsAreProvided
      ? 'The seed phrase is not complete'
      : !allWordsAreValid
      ? 'Some words are invalid, please check them again'
      : '';
    setError(error);
    const keyPhraseIsValid = allWordsAreProvided && allWordsAreValid;
    return keyPhraseIsValid;
  };

  const handleImportFromPhrase = async () => {
    const keyPhraseString = words.join(' ');
    const keyPhraseIsValid = validateKeyPhrase(words);

    if (keyPhraseIsValid) {
      setError('');
      try {
        setLoading(true);

        const encryptedSecretPhrase: string = await encrypt(
          appPin,
          keyPhraseString
        );
        const accounts = await createNodeWallets(
          keyPhraseString,
          accountName,
          encryptedSecretPhrase
        );

        if (setImportedWalletAsDefault) {
          await setActiveAccount(accountName);
        }
        setLoading(false);
        onImportSuccess({
          mainAccountPubKey: accounts.mainAccountPubKey,
          accountName,
        });
      } catch (error: any) {
        setError(error);
        setLoading(false);
        if (onImportFail) {
          onImportFail(error);
        }
      }
    }
  };

  const classes = twMerge(
    'columns-2 bg-finnieBlue-light-secondary w-[360px] xl:w-[560px] rounded py-4 px-[30px] select-text transition-all duration-300 ease-in-out',
    className ?? ''
  );

  return (
    <div className="relative">
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
                    className={`w-[120px] xl:w-[200px] p-1 rounded-md bg-transparent focus:ring-1 focus:ring-finnieTeal focus:outline-none text-sm focus:bg-finnieBlue-light-secondary ${
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
      <div className="flex flex-col items-center justify-center mt-6 md2h:mt-10">
        <div className="h-12 -mt-4">
          {error && <ErrorMessage error={error} />}
        </div>

        {loading ? (
          <LoadingSpinner className="m-auto w-12 h-12" />
        ) : (
          <Button
            onClick={handleImportFromPhrase}
            label={confirmActionLabel}
            className="font-semibold bg-white text-finnieBlue-light w-[240px] h-[48px]"
          />
        )}
      </div>
    </div>
  );
}

export default ImportFromSeedPhrase;
