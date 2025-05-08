import {
  CheckSuccessLine,
  GroupPeopleLine,
  Icon,
} from '@_koii/koii-styleguide';
import React from 'react';
import { useQuery } from 'react-query';

import { Popover } from 'renderer/components/ui/Popover/Popover';
import { useClipboard } from 'renderer/features/common/hooks';
import { useMainAccount } from 'renderer/features/settings/hooks';
import { getReferralCode, QueryKeys } from 'renderer/services';

const ICON_SIZE = 20;

export function ReferralCode() {
  const { data: mainAccountPubKey = '' } = useMainAccount();

  const { data: referralCode = '' } = useQuery(
    [QueryKeys.ReferralCode, mainAccountPubKey],
    () => getReferralCode(mainAccountPubKey)
  );

  const handleCopy = () => {
    const referralParagraph = `I just joined the Koii Network! Turn any computer into a passive income generating node in 5 minutes.

Join me and let's build the future together: https://www.koii.network/node?refCode=${referralCode}.`;
    copyToClipboard(referralParagraph);
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
    : 'Copy your referral code to share it with your friends.';

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
          >
            <div className="flex items-center justify-center h-full gap-1 px-1 xl:px-3 md2:px-5 transition-all duration-300 ease-in-out">
              <Icon
                source={isCopied ? CheckSuccessLine : GroupPeopleLine}
                size={ICON_SIZE}
                data-testid="key-unlock-icon"
                aria-label="key-unlock icon"
              />

              <span className="text-sm">Referral</span>
            </div>
          </div>
          <div className="flex overflow-hidden items-center justify-center m-auto">
            <p className="px-1 overflow-hidden text-xs xl:text-sm w-fit whitespace-nowrap text-ellipsis">
              {referralCode}
            </p>
          </div>
        </div>
      </div>
    </Popover>
  );
}
