import {
  CheckSuccessLine,
  CloseLine,
  Icon,
  WarningCircleLine,
} from '@_koii/koii-styleguide';
import React from 'react';

import { ModalContent } from 'renderer/features/modals';
import { Theme } from 'renderer/types/common';

import { KeyType } from '../types';

import { AccountInfo } from './AccountInfo';

type PropsType = Readonly<{
  onClose: () => void;
  newKey: KeyType;
  title: string;
}>;

export function AccountCreatedOrImported({
  onClose,
  newKey,
  title,
}: PropsType) {
  return (
    <ModalContent theme={Theme.Dark} className="pb-5 pt-2 text-white w-[779px]">
      <div className="flex justify-between w-full p-3">
        <div className="flex items-center justify-between pl-6">
          <Icon
            source={CheckSuccessLine}
            className="w-8 h-8 m-2 text-finnieEmerald-light"
          />
          <span className="text-[24px] pl-5 text-white">{title}</span>
        </div>
        <Icon
          source={CloseLine}
          className="w-8 h-8 cursor-pointer"
          onClick={onClose}
        />
      </div>

      <div className="px-12 text-base text-left leading-8 mb-4 font-light">
        Keep your address at hand so you can easily fund your key and start
        running tasks. You can choose which account to use when running task in
        key management panel.
      </div>

      <div className="flex flex-col items-center justify-center gap-8 px-12 pb-3 w-full">
        <AccountInfo
          accountName={newKey.accountName}
          address={newKey.system ?? ''}
        />
      </div>
      <div className="flex flex-row items-center w-full gap-4 text-finnieOrange px-11 text-left">
        <Icon source={WarningCircleLine} className="h-9 w-9 m-2" />
        <p className="text-xs leading-4 font-light">
          You can only claim rewards from an account when it is set as the main
          account. To claim rewards from a different one, go to Key Management
          and click the star next to the account you want to claim.
        </p>
      </div>
    </ModalContent>
  );
}
