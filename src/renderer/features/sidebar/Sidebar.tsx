import React from 'react';

import {
  AvailableBalanceInfoBox,
  MainWalletView,
  RewardsClaimBox,
  RewardsInfoBox,
  SidebarActions,
  StakeInfoBox,
} from './components';
import { ReferralCode } from './components/ReferralCode';
import { useSidebraLogic } from './hooks';

export function Sidebar() {
  const {
    rewardsInfoBoxState,
    nodeInfoData,
    handleClickClaim,
    isClaimingRewards,
    isRewardClaimable,
    isAddTaskView,
    handleAddFundsClick,
    handleSecondaryActionClick,
  } = useSidebraLogic();

  return (
    <div className="flex flex-col pr-[22px] gap-4 lgh:gap-4 transition-all duration-300 ease-in-out">
      <RewardsInfoBox rewardState={rewardsInfoBoxState} />
      <RewardsClaimBox
        rewardsAmount={nodeInfoData?.pendingRewards ?? {}}
        rewardClaimable={isRewardClaimable}
        onRewardClaimClick={handleClickClaim}
        isClaimingRewards={isClaimingRewards}
      />
      <StakeInfoBox totalStaked={nodeInfoData?.totalStaked ?? {}} />

      <AvailableBalanceInfoBox />
      <SidebarActions
        showMyNodeAction={isAddTaskView}
        onPrimaryActionClick={handleAddFundsClick}
        onSecondaryActionClick={handleSecondaryActionClick}
      />

      <MainWalletView />
      <ReferralCode />

      {/* <div className="pb-5 mt-auto">
        <VersionDisplay />
      </div> */}
    </div>
  );
}
