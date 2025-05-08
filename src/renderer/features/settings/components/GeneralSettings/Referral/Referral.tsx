import {
  Button,
  ButtonSize,
  ButtonVariant,
  CheckSuccessLine,
  CopyLine,
  Icon,
} from '@_koii/koii-styleguide';
import React from 'react';
import { useQuery } from 'react-query';

import { LoadingSpinner, Tooltip } from 'renderer/components/ui';
import { useClipboard } from 'renderer/features/common';
import { QueryKeys, getReferralCode } from 'renderer/services';

import { useMainAccount, useUserAppConfig } from '../../../hooks';

export function Referral() {
  const { data: mainAccountPubKey = '' } = useMainAccount();

  const { data: referralCode = '' } = useQuery(
    [QueryKeys.ReferralCode, mainAccountPubKey],
    () => getReferralCode(mainAccountPubKey)
  );

  const { userConfig, handleSaveUserAppConfig } = useUserAppConfig({});

  const { copyToClipboard: copyLink, copied: linkCopied } = useClipboard();

  const copyReferralLink = () => {
    const referralParagraph = `I just joined the Koii Network! Turn any computer into a passive income generating node in 5 minutes.
    
Join me and let's build the future together: https://www.koii.network/node?refCode=${referralCode}`;
    copyLink(referralParagraph);
    handleSaveUserAppConfig({ settings: { hasCopiedReferralCode: true } });
  };

  const shouldSeeTheNewTag = userConfig?.hasCopiedReferralCode === false;

  const tooltipContent = linkCopied
    ? 'Copied!'
    : 'Copy your referral code to share it with your friends.';

  return (
    <div className="font-light text-white">
      <p className="mb-2">
        Share your referral link and get 5 extra tokens for each friend who
        joins the network.
      </p>
      <p>
        With this link, they’ll get 5 bonus tokens from the faucet after
        verifying Twitter and Discord accounts. After they run a node for 7
        days, you’ll get 5 and they’ll get 5 more.
      </p>
      <div className="flex items-center mt-5 gap-6">
        {referralCode ? (
          <>
            <Tooltip tooltipContent={tooltipContent}>
              <Button
                variant={ButtonVariant.Secondary}
                size={ButtonSize.SM}
                buttonClassesOverrides="!transition-all !duration-300 ease-in-out focus:text-white focus:text-white"
                label="Copy My Referral Link"
                labelClassesOverrides="mx-auto focus:text-white focus:text-white"
                data-testid="copy-referrals-button"
                id="copy-referrals-button"
                onClick={copyReferralLink}
                iconLeft={
                  <Icon
                    onClick={copyReferralLink}
                    source={linkCopied ? CheckSuccessLine : CopyLine}
                    className={`text-blue cursor-pointer mr-3 ${
                      linkCopied ? 'h-5 w-5' : 'h-5 w-5'
                    }`}
                  />
                }
              />
              {/* <Button
                label="Copy My Referral Link"
                icon={
                  <Icon
                    onClick={copyReferralLink}
                    source={linkCopied ? CheckSuccessLine : CopyLine}
                    className={`text-blue cursor-pointer ${
                      linkCopied ? 'h-5.5 w-5.5' : 'h-5 w-5'
                    }`}
                  />
                }
                onClick={copyReferralLink}
                className="font-semibold bg-white text-finnieBlue-light text-[14px] leading-[14px] min-w-[250px] h-9 self-end"
              /> */}
            </Tooltip>
            <div className="px-6 py-2 text-sm rounded-md bg-finnieBlue-light-tertiary w-fit">
              {referralCode}
            </div>
          </>
        ) : (
          <LoadingSpinner className="ml-20 h-9" />
        )}
      </div>
    </div>
  );
}
