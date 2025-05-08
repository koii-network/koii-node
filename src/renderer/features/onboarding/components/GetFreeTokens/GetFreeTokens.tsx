import {
  CheckSuccessLine,
  CloseLine,
  CopyLine,
  CurrencyMoneyLine,
  TipGiveLine,
} from '@_koii/koii-styleguide';
import { trackEvent } from '@aptabase/electron/renderer';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import config from 'config';
import { FAUCET_UTM_PARAMS } from 'config/faucet';
import { Button } from 'renderer/components/ui';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { useClipboard } from 'renderer/features/common/hooks/useClipboard';
import { useMainAccount } from 'renderer/features/settings/hooks/useMainAccount';
import { openBrowserWindow } from 'renderer/services';
import { AppRoute } from 'renderer/types/routes';

export function GetFreeTokens({
  closeModal,
  accountPublicKey,
}: {
  closeModal?: () => void;
  accountPublicKey?: string;
}) {
  const navigate = useNavigate();

  const { data: mainAccountPubKey = '' } = useMainAccount();
  const accountPublicKeyToUse = accountPublicKey || mainAccountPubKey;

  const openFaucet = async () => {
    await window.main.verifyMessage({});
    const urlToFaucet = `${config.faucet.FAUCET_URL}?key=${accountPublicKeyToUse}&${FAUCET_UTM_PARAMS}`;
    openBrowserWindow(urlToFaucet);
    trackEvent('open_faucet', {
      walletAddress: accountPublicKeyToUse,
      behavior: 'open_faucet_page',
    });
  };

  const { copyToClipboard, copied: hasCopiedMainAccountPubKey } =
    useClipboard();

  const copyMainAccountPubKey = () => {
    copyToClipboard(accountPublicKeyToUse);
  };
  const copyTooltipContent = hasCopiedMainAccountPubKey
    ? 'Copied!'
    : 'Copy your address';
  const CopyIcon = hasCopiedMainAccountPubKey ? CheckSuccessLine : CopyLine;
  const clickClose =
    closeModal || (() => navigate(AppRoute.OnboardingSeeBalance));

  return (
    <div className="relative flex items-center justify-center text-white text-center bg-purple-5 rounded py-10 2xl:scale-125 transition-all duration-300 ease-in-out">
      <button
        className="absolute -right-2.5 -top-3 text-white"
        onClick={clickClose}
      >
        <CloseLine className="w-6 h-6" />
      </button>
      <div className="flex flex-col gap-6 px-16">
        <TipGiveLine className="w-8 h-8 mx-auto rotate-180 -mb-4" />
        <div className="font-semibold">Get free tokens</div>
        <div className="font-light w-80 2xl:w-96 mx-auto">
          <p>
            Visit the Faucet to validate your identity and get some free KOII +
            FIRE. Come back to the node after you finish the process, and your
            balance will be updated automatically.
          </p>
        </div>

        <div>
          <Popover tooltipContent={copyTooltipContent}>
            <button
              onClick={copyMainAccountPubKey}
              className="my-2 border-2 border-finnieTeal text-finnieTeal rounded-full p-2 flex items-center gap-4 hover:text-white transition-all duration-300 ease-in-out hover:border-white cursor-pointer"
            >
              <CopyIcon />
              <span className="text-xs select-text underline font-light">
                {accountPublicKeyToUse}
              </span>
            </button>
          </Popover>
        </div>
        <div className="flex flex-col items-center gap-4">
          <Button
            className="font-semibold bg-finnieGray-light text-finnieBlue-light w-[220px] h-[48px] hover:brightness-110"
            label="Go to the faucet"
            icon={<CurrencyMoneyLine className="w-5 h-5" />}
            onClick={openFaucet}
          />
        </div>
      </div>
    </div>
  );
}
