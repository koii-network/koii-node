import {
  CopyLine,
  Icon,
  CheckSuccessLine,
  KeyUnlockLine,
} from '@_koii/koii-styleguide';
import React, { useRef } from 'react';

import { Tooltip, Button } from 'renderer/components/ui';
import { useClipboard } from 'renderer/features/common/hooks';
import { Address } from 'renderer/features/tasks/components/AvailableTaskRow/components/Address';

type PropsType = Readonly<{
  accountName: string;
  address: string;
}>;

export function AccountInfo({ accountName, address }: PropsType) {
  const addressRef = useRef<HTMLSpanElement>(null);

  const { copyToClipboard, copied: hasCopiedKey } = useClipboard();

  const handleCopyPublicKey = () => copyToClipboard(address);

  return (
    <div className="bg-finnieBlue-light-tertiary text-lg shadow leading-8 p-4 gap-1 flex flex-col items-start rounded-md w-[100%]">
      <div className="font-bold text-lg text-finnieEmerald-light flex justify-start items-center gap-2">
        <Icon source={KeyUnlockLine} className="h-4 w-4" />
        <p>{accountName}</p>
      </div>
      <div className="flex justify-start">
        {address && (
          <>
            <span ref={addressRef} className="pr-2">
              <Address address={address} />
            </span>

            <div className="flex justify-center gap-4">
              <Tooltip tooltipContent={hasCopiedKey ? 'Copied' : 'Copy'}>
                <Button
                  onClick={handleCopyPublicKey}
                  icon={
                    <Icon
                      source={hasCopiedKey ? CheckSuccessLine : CopyLine}
                      className="text-finnieTeal-100 h-4 w-4"
                    />
                  }
                  className="rounded-full w-6.5 h-6.5 bg-transparent"
                />
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
