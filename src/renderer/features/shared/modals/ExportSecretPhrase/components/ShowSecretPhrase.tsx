import React, { memo } from 'react';

import { Button } from 'renderer/components/ui/Button';

type PropsType = {
  onClose: () => void;
  seedPhrase: string;
};

function ShowSecretPhrase({ onClose, seedPhrase }: PropsType) {
  const phraseWords = seedPhrase.split(' ');

  return (
    <div>
      <div className="flex justify-center pt-5">
        <div className="selection-text columns-2 bg-finnieBlue-light-tertiary w-[347px] rounded py-4 px-[30px] select-text">
          {phraseWords.map((word, index) => {
            const wordNumber = index + 1;
            return (
              <div
                className="gap-3 mb-2 text-sm text-left select-text"
                key={word}
              >{`${wordNumber}. ${word}`}</div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center mt-10">
        <Button
          onClick={onClose}
          label="Got it"
          className="font-semibold bg-white text-finnieBlue-light w-[220px] h-[48px]"
        />
      </div>
    </div>
  );
}

export default memo(ShowSecretPhrase);
