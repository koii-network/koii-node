import { CheckSuccessFill, Icon } from '@_koii/koii-styleguide';
import { trackEvent } from '@aptabase/electron/renderer';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import config from 'config';
import { FAUCET_UTM_PARAMS } from 'config/faucet';
import { Button } from 'renderer/components/ui';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { useFundNewAccountModal } from 'renderer/features/common';
import { openBrowserWindow } from 'renderer/services';
import { AppRoute } from 'renderer/types/routes';

function CreateNewKey() {
  const navigate = useNavigate();

  const location = useLocation();
  const mainAccountPubKey = location?.state?.mainAccountPubKey || '';

  const openFaucet = async () => {
    await window.main.verifyMessage({});
    const urlToFaucet = `${config.faucet.FAUCET_URL}?key=${mainAccountPubKey}&${FAUCET_UTM_PARAMS}`;
    openBrowserWindow(urlToFaucet);
    trackEvent('open_faucet', {
      walletAddress: mainAccountPubKey,
      behavior: 'open_faucet_page',
    });
    navigate(AppRoute.OnboardingSeeBalance);
  };

  const { showModal: showFundAccountModal } = useFundNewAccountModal({
    accountPublicKey: mainAccountPubKey,
  });
  const sendFunds = () => {
    navigate(AppRoute.OnboardingSeeBalance);
    showFundAccountModal();
  };

  return (
    <div className="text-lg leading-8 flex flex-col gap-[2vh] md2h:gap-[5vh] transition-all duration-300 ease-in-out">
      <div className="flex flex-col items-center justify-start w-full gap-4 mb-4 text-2xl 2xl:text-3xl md2h:text-3xl font-semibold transition-all duration-300 ease-in-out">
        <Icon
          source={CheckSuccessFill}
          className="w-8 h-8 m-2 text-finnieEmerald-light"
        />
        <span>New Account Created!</span>
      </div>

      <div className="w-full text-center text-sm 2xl:text-base md2h:text-base text-light underline-offset-2 transition-all duration-300 ease-in-out">
        <p className="font-bold mb-4">Next step: Fuel up with tokens</p>

        <div className="mb-4">
          <span>You need </span>
          <Popover
            tooltipContent='You’ll need $KOII (native token) as a deposit,
also known as a "stake", to run tasks on our network.'
          >
            <span className="underline cursor-default">$KOII</span>
          </Popover>
          <span> tokens to run your first task!</span>
        </div>

        <div className="w-[40vw]">
          <span>
            <Popover tooltipContent="The Koii Faucet is a portal that allows users to receive small amounts of KOII tokens for free.">
              Visit our{' '}
              <button
                className="underline hover:cursor-pointer hover:text-finnieTeal-100"
                onClick={() => openFaucet()}
              >
                Koii Faucet
              </button>
            </Popover>
            <span>
              {' '}
              to get free tokens or ask a friend for some KOII to send funds to
              your account.
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between w-full gap-4 mt-6">
        <div className="flex flex-col items-center gap-4">
          <Button
            className="font-semibold bg-finnieGray-light text-finnieBlue-light w-[260px] h-[48px]"
            label="Get Free Tokens"
            onClick={openFaucet}
          />
          <Button
            className="font-semibold border text-white border-white bg-transparent w-[260px] h-[48px]"
            label="Send Funds"
            onClick={sendFunds}
          />
        </div>
        <Button
          label="Back Up My Secret Phrase"
          onClick={() => navigate(AppRoute.OnboardingBackupKeyNow)}
          className="font-semibold bg-transparent text-white w-auto h-[48px] px-6 py-[14px] underline hover:border-2 hover:border-white"
        />
        <div className="w-[25vw] h-8 text-center text-finnieTeal-100 text-xs 2xl:text-sm md2h:text-sm transition-all duration-300 ease-in-out">
          <span className="font-bold">Back It Up Anytime. </span>
          <span>
            You can back up your secret phrase later from your account settings
          </span>
        </div>
      </div>
    </div>
  );
}

export default CreateNewKey;
