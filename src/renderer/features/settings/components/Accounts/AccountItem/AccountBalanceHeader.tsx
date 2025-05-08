import {
  FavoriteStarFill,
  FavoriteStarLine,
  Icon,
} from '@_koii/koii-styleguide';
import React from 'react';

import { Button } from 'renderer/components/ui/Button';
import { LoadingSpinner } from 'renderer/components/ui/LoadingSpinner';
import { Popover } from 'renderer/components/ui/Popover/Popover';

type PropsType = {
  accountName: string;
  setAccountActiveLoading?: boolean;
  setAccountActive: () => Promise<void>;
  isDefault: boolean;
};

export function AccountBalancesHeader({
  accountName,
  setAccountActiveLoading,
  setAccountActive,
  isDefault,
}: PropsType) {
  const StarIcon = isDefault ? FavoriteStarFill : FavoriteStarLine;

  return (
    <div className="flex gap-2 pl-2 text-xl font-semibold text-white">
      {accountName}
      {setAccountActiveLoading ? (
        <LoadingSpinner />
      ) : (
        <Popover tooltipContent="Select as active account">
          <Button
            onClick={async () => setAccountActive()}
            icon={
              <Icon source={StarIcon} className="w-5 h-5 text-finnieTeal-100" />
            }
            className="w-6 h-6 bg-transparent rounded-full"
          />
        </Popover>
      )}
    </div>
  );
}
