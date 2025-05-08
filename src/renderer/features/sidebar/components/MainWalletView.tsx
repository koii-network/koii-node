import { CheckSuccessLine, Icon, KeyUnlockLine } from '@_koii/koii-styleguide';
import React from 'react';

import { Popover } from 'renderer/components/ui/Popover/Popover';
import { useClipboard } from 'renderer/features/common/hooks';
import { useMainAccount } from 'renderer/features/settings/hooks';

const ICON_SIZE = 20;

export function MainWalletView() {
  const { data: mainAccountPublicKey } = useMainAccount();
  const shortenMainAccountPubKey = `${mainAccountPublicKey?.substring(
    0,
    9
  )}...${mainAccountPublicKey?.substring(
    mainAccountPublicKey.length - 7,
    mainAccountPublicKey.length
  )}`;
  const handleCopy = () => {
    copyToClipboard(mainAccountPublicKey || '');
  };
  const handleKeyDown =
    (callback: () => void) => (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        callback();
      }
    };
  const { copyToClipboard, copied: isCopied } = useClipboard();

  const tooltipContent = isCopied
    ? 'Copied!'
    : "Copy your system wallet's address.";

  return (
    <Popover tooltipContent={tooltipContent}>
      <div
        className="flex flex-col text-white w-[186px] xl:w-[230px] md2:w-[350px] xl1:w-[450px] xl2:w-[550px] rounded border-2 border-finnieBlue-light-secondary transition-all duration-300 ease-in-out"
        role="button"
        onClick={handleCopy}
        onKeyDown={handleKeyDown(handleCopy)}
        tabIndex={0}
      >
        <div
          className={`transition-all duration-300 ease-in-out flex h-[40px] lgh2:h-14 ${
            isCopied ? 'bg-purple-5/[0.5]' : 'bg-transparent'
          }`}
        >
          <div
            className={`transition-all duration-300 ease-in-out ${
              isCopied ? 'bg-purple-5' : 'bg-finnieBlue-light-secondary'
            }`}
            style={{
              width: '17%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              source={isCopied ? CheckSuccessLine : KeyUnlockLine}
              size={ICON_SIZE}
              data-testid="key-unlock-icon"
              aria-label="key-unlock icon"
            />
          </div>
          <div className="flex items-center justify-center m-auto">
            <p className="px-1 overflow-hidden text-xs xl:text-sm w-fit whitespace-nowrap text-ellipsis">
              {shortenMainAccountPubKey}
            </p>
          </div>
        </div>
      </div>
    </Popover>
  );
}
