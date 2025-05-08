import React from 'react';

import CloseIcon from 'assets/svgs/close-icon.svg';
import { openMainLogs } from 'renderer/utils';

interface Props {
  runTaskAgain: () => void;
}

export function FailedMessage({ runTaskAgain }: Props) {
  return (
    <div className="h-[67px] w-full flex justify-start items-center text-white border-b-2 border-white relative">
      <div className="h-[67px] w-full absolute bg-[#FFA6A6] opacity-30" />
      <CloseIcon className="w-[45px] h-[45px] z-10 mr-5" />
      <div className="z-10">
        <p>
          Oops, something&apos;s not quite right.{' '}
          <span
            onClick={openMainLogs}
            className="text-finnieTeal-100 underline cursor-pointer"
          >
            Retrieve the logs
          </span>{' '}
          or attempt to{' '}
          <span
            onClick={runTaskAgain}
            className="text-finnieTeal-100 underline cursor-pointer"
          >
            run it again.
          </span>
        </p>
      </div>
      <div />
    </div>
  );
}
