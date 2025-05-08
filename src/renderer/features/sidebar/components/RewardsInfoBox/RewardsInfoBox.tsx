import {
  CurrencyMoneyLine,
  Icon,
  RewardsEarnLine,
  WarningCircleLine,
} from '@_koii/koii-styleguide';
import Lottie from '@novemberfiveco/lottie-react-light';
import React, { useMemo } from 'react';
import { useQuery } from 'react-query';

import SparksAnimation from 'assets/animations/sparks.json';
import tokenAnimation from 'assets/animations/token-animation.gif';
import { SAFE_AVERAGE_SLOT_TIME } from 'config/refetchIntervals';
import { LoadingSpinner, Tooltip } from 'renderer/components/ui';
import { useAverageSlotTime } from 'renderer/features/common';
import { QueryKeys } from 'renderer/services';
import { getTimeToNextReward } from 'renderer/services/api';
import { Theme } from 'renderer/types/common';

import { RewardsState } from '../../types';
import { getTimeToNextRewardHumanReadable } from '../../utils';
import { InfoBox } from '../InfoBox';

const NEXT_REWARD_REFETCH_INTERVAL = 1000 * 60; // 1 minute

type PropsType = {
  rewardState?: RewardsState;
};

export function RewardsInfoBox({
  rewardState = RewardsState.NoRunningTasks,
}: PropsType) {
  const { data: averageSlotTime } = useAverageSlotTime();
  const {
    data: timeToNextReward,
    error: timeToNextRewardError,
    isLoading: isLoadingTimeToNextReward,
  } = useQuery(
    QueryKeys.TimeToNextReward,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => getTimeToNextReward(averageSlotTime ?? SAFE_AVERAGE_SLOT_TIME),
    {
      refetchInterval: NEXT_REWARD_REFETCH_INTERVAL,
      enabled: !!averageSlotTime,
      retry: 3,
    }
  );

  const { format, value: timeToNextRewardConverted } = useMemo(
    () => getTimeToNextRewardHumanReadable(timeToNextReward ?? 0),
    [timeToNextReward]
  );

  const viewByState = useMemo(
    () => ({
      [RewardsState.TimeToNextReward]: timeToNextRewardError ? (
        <>
          <Icon
            source={WarningCircleLine}
            className="mb-[4px] text-finnieRed"
            size={24}
            data-testid="rewards-icon"
          />
          <span className="flex items-center justify-center mt-2 text-xs text-center text-finnieRed">
            Error while fetching time to next reward
          </span>
        </>
      ) : (
        <Tooltip
          tooltipContent="The timing of your next reward is approximate."
          theme={Theme.Light}
          placement="top-right"
        >
          <div className="flex flex-col items-center">
            <Icon
              source={CurrencyMoneyLine}
              className="mb-[4px] text-green-2"
              size={24}
              data-testid="rewards-icon"
            />

            {isLoadingTimeToNextReward ? (
              <LoadingSpinner className="w-10 h-10" />
            ) : (
              <>
                <span className="text-green-2">
                  {timeToNextRewardConverted} {format}
                </span>

                <span className="text-xs">until next reward</span>
              </>
            )}
          </div>
        </Tooltip>
      ),
      [RewardsState.RewardReceived]: (
        <div className="relative flex flex-col items-center">
          <Lottie
            start={1}
            animationData={SparksAnimation}
            className="absolute w-24 h-24 transform -rotate-45 -left-10 -top-12"
          />
          <Lottie
            start={1}
            animationData={SparksAnimation}
            className="absolute w-24 h-24 transform rotate-135 top-10 -right-10"
          />

          <img className="w-8 h-8" src={tokenAnimation} alt="loading" />
          <span className="text-green-2">Congratulations!</span>
          <span className="text-xs">rewards earned</span>
        </div>
      ),
      [RewardsState.NoRunningTasks]: (
        <>
          <Icon
            source={RewardsEarnLine}
            data-testid="pending-rewards-icon"
            className="mb-[4px] h-10 w-10 xl:h-12 xl:w-12"
            size={48}
          />
          <span className="xl:text-xl text-green-2">Run a task</span>
          <span className="text-xs">to earn rewards</span>
        </>
      ),
    }),
    [timeToNextRewardError, timeToNextRewardConverted, format]
  );

  return (
    <InfoBox className="flex flex-col items-center justify-center p-2 h-20 md2h:h-32 w-[186px] xl:w-[230px] md2:w-[350px] xl1:w-[450px] xl2:w-[550px]">
      {viewByState[rewardState]}
    </InfoBox>
  );
}
