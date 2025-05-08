import { render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import * as api from 'renderer/services/api';

import { RewardsState } from '../../types';
import * as utils from '../../utils';

import { RewardsInfoBox } from './RewardsInfoBox';

jest.mock('renderer/services/api', () => ({
  getTimeToNextReward: jest.fn(),
}));

jest.mock('../../utils', () => ({
  getTimeToNextRewardHumanReadable: jest.fn(),
}));

const queryClient = new QueryClient();

describe('RewardsInfoBox', () => {
  beforeEach(() => {
    queryClient.removeQueries();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should display time to next reward when state is TimeToNextReward', async () => {
    const mockTime = 10000; // 10 seconds
    const mockFormat = 'secs';
    const mockFormattedTime = '10';
    (api.getTimeToNextReward as jest.Mock).mockResolvedValue(mockTime);
    (utils.getTimeToNextRewardHumanReadable as jest.Mock).mockReturnValue({
      format: mockFormat,
      value: mockFormattedTime,
    });

    render(<RewardsInfoBox rewardState={RewardsState.TimeToNextReward} />, {
      wrapper,
    });

    expect(
      screen.getByText(`${mockFormattedTime} ${mockFormat}`)
    ).toBeInTheDocument();
    expect(screen.getByText('until next reward')).toBeInTheDocument();
  });

  it('should display reward received when state is RewardReceived', async () => {
    render(<RewardsInfoBox rewardState={RewardsState.RewardReceived} />, {
      wrapper,
    });

    expect(screen.getByText('Congratulations!')).toBeInTheDocument();
    expect(screen.getByText('rewards earned')).toBeInTheDocument();
  });

  it('should display run a task message when state is NoRunningTasks', async () => {
    render(<RewardsInfoBox rewardState={RewardsState.NoRunningTasks} />, {
      wrapper,
    });

    expect(screen.getByText('Run a task')).toBeInTheDocument();
    expect(screen.getByText('to earn rewards')).toBeInTheDocument();
  });
});
