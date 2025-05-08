import React from 'react';

import { useFundStakingAccountModal } from 'renderer/features/common/hooks/useFundStakingAccountModal';

import { useNotificationActions } from '../../useNotificationStore';

export function FundStakingAccountButton({
  notificationId,
}: {
  notificationId: string;
}) {
  const { markAsRead } = useNotificationActions();

  const { showModal: showFundStakingAccountModal } =
    useFundStakingAccountModal();

  const handleClickCTA = () => {
    markAsRead(notificationId);
    showFundStakingAccountModal();
  };

  return (
    // <Button
    //   label="Fund Now"
    //   onClick={handleClickCTA}
    //   variant={ButtonVariant.SecondaryDark}
    //   size={ButtonSize.SM}
    //   labelClassesOverrides="font-semibold w-max !text-white"
    //   buttonClassesOverrides="!border-white  !hover:border-red-500 !hover:bg-green-500 !hover:bg-black-500"
    // />

    <button
      onClick={handleClickCTA}
      className="text-white bg-transparent text-white font-semibold w-max px-4 py-2 rounded-[4px] border-white border-2  hover:bg-[rgb(243,243,247)]/[0.1] hover:shadow-xl transition-all duration-300 ease-in-out"
    >
      Fund Now
    </button>
  );
}
